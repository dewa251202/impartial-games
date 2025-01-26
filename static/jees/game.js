import { Piles } from "pile";
import { Player, HumanPlayer, PcPlayer } from "player";

class MultiplePilesGame {
    #piles;
    #turnIndex;
    #players;
    #board;

    /**
     * 
     * @param {number[]} piles 
     * @param {Player} firstPlayer 
     * @param {Player} secondPlayer 
     */
    constructor(piles, firstPlayer, secondPlayer){
        firstPlayer ??= new HumanPlayer('First player');
        secondPlayer ??= new PcPlayer('Second player');

        this.#piles = piles;
        this.#turnIndex = 0;
        this.#players = [firstPlayer, secondPlayer];
        this.#board = new Piles(this.#piles, this);
    }

    /**
     * 
     * @param {number} pileIndex 
     * @param {number} itemIndex 
     * @returns 
     */
    isValidMove(pileIndex, itemIndex){
        const itemCount = this.#piles[pileIndex];
        if(!(0 <= itemIndex && itemIndex < itemCount)) return false;
        return true;
    }

    tryMove(data){
        const { pileIndex, itemIndex } = data;
        if(pileIndex === undefined || !(0 <= pileIndex && pileIndex < this.#piles.length)){
            return null;
        }

        if(!this.isValidMove(pileIndex, itemIndex)){
            return null;
        }

        const itemCount = this.#piles[pileIndex];
        const removedItemIndices = [];
        for(let i = itemIndex; i < itemCount; i++){
            removedItemIndices.push(i);
        }

        return removedItemIndices;
    }

    makeMove(data){
        const { pileIndex, itemIndex } = data;
        if(pileIndex === undefined || !(0 <= pileIndex && pileIndex < this.#piles.length)){
            return null;
        }

        this.#piles[pileIndex] = itemIndex;
        this.#turnIndex++;
        const playerRole = this.#players[this.#turnIndex % 2].getRole();
        document.querySelector('.player-turn').innerText = `${playerRole} turn`;
    }

    getState(){
        return {
            turnNumber: this.#turnIndex + 1,
            currentPlayer: this.#players[this.#turnIndex % 2]
        };
    }

    display(){
        const gameBoard = document.querySelector('.game .board');
        gameBoard.innerHTML = '';
        gameBoard.appendChild(this.#board);
    }

    getItemCount(pileIndex){
        return this.#piles[pileIndex];
    }
}

class SinglePileNim {
    currentItemCount;

    /**
     * 
     * @param {number} itemCount 
     */
    constructor(itemCount){
        this.currentItemCount = itemCount;
    }

    /**
     * 
     * @param {number} removedItemCount 
     * @returns 
     */
    makeMove(removedItemCount){
        if(!this.isValidMove(removedItemCount)) return false;
        
        return true;
    }

    /**
     * 
     * @param {number} removedItemCount 
     */
    moveToNextState(removedItemCount){
        this.currentItemCount -= removedItemCount;
    }

    /**
     * 
     * @param {number} removedItemCount 
     * @returns 
     */
    isValidMove(removedItemCount){
        return 1 <= removedItemCount && removedItemCount <= this.currentItemCount;
    }

    getNextPossibleGames(){
        return this.getNextPossibleStates().map(state => new SinglePileNim(state));
    }

    getNextPossibleStates(){
        const nextPossibleStates = [];
        for(let i = 0; i < this.currentItemCount; i++){
            nextPossibleStates.push(i);
        }
        return nextPossibleStates;
    }
}

class GameCombinations {
    #games;
    #nimberAnalyzer;

    /**
     * 
     * @param {SinglePileNim[]} games 
     */
    constructor(games){
        this.#games = games ?? [];
        this.#nimberAnalyzer = new NimberAnalyzer(this.#games);
    }

    getNimSum(){
        return this.#games
            .map(game => this.#nimberAnalyzer.calculateNimber(game))
            .reduce((accumulator, currentValue) => accumulator ^ currentValue, 0);
    }

    isWinningGame(){
        return this.getNimSum() > 0;
    }

    isLosingGame(){
        return !this.isWinningGame();
    }
}

class NimberAnalyzer {
    #games;
    #nimbers;

    /**
     * 
     * @param {SinglePileNim[]} games 
     */
    constructor(games){
        this.#games = games ?? [];
        this.#nimbers = new Map();
        this.#games.forEach(game => this.calculateNimber(game));
    }

    /**
     * Returns the nimber (Grundy value) of a game
     * @param {SinglePileNim} game 
     * @returns {number}
     */
    calculateNimber(game){
        if(this.#nimbers.has(game)) return this.#nimbers.get(game);
        const nextPossibleGames = game.getNextPossibleGames();
        return mex(nextPossibleGames.map(g => this.calculateNimber(g)));
    }
}

/**
 * Returns the smallest non-negative integer that doesn't exist in the set
 * @param {number[]} numbers 
 * @returns 
 */
function mex(numbers){
    let result = 0;
    numbers.sort((a, b) => a - b);
    for(const number of numbers){
        if(number === result) result++;
    }
    return result;
}

export { MultiplePilesGame, SinglePileNim, GameCombinations };