import { getRandomInt, shuffled } from "common";
import { NimberAnalyzer } from "./nimber.js";

class GameCombinations {
    #games;
    #movableGames;
    #nimberAnalyzer;

    /**
     * 
     * @param {ImpartialGame[]} games 
     */
    constructor(games){
        this.#games = games ?? [];
        this.#movableGames = this.#games
            .map((game, index) => ({ index, game }))
            .filter(data => data.game.canMove());
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

    /**
     * 
     * @param {number} gameIndex 
     * @param {number} moveData 
     * @returns {boolean}
    */
    isValidMove(gameIndex, moveData){
       return this.#games[gameIndex].isValidMove(moveData);
    }
    
    /**
     * 
     * @param {number} gameIndex 
     * @param {number} moveData 
     * @returns {boolean}
    */
    makeMove(gameIndex, moveData){
        const game = this.#games[gameIndex];
        const moveMade = game.makeMove(moveData);
        if(moveMade && !game.canMove()){
            const index = this.#movableGames.findIndex(movableGame => movableGame.game === game);
            this.#movableGames.splice(index, 1);
        }
        return moveMade;
    }

    getGames(){
        return this.#games;
    }

    /**
     * 
     * @param {number} index 
     * @returns 
     */
    getGame(index){
        return this.#games[index];
    }

    canMove(){
        return this.#movableGames.length > 0;
    }

    getRandomNextState(){
        if(this.#movableGames.length === 0) return null;
        const gameIndex = getRandomInt(0, this.#movableGames.length - 1);
        const gameData = this.#movableGames[gameIndex];
        const nextPossibleStates = gameData.game.getNextPossibleStates();
        const stateIndex = getRandomInt(0, nextPossibleStates.length - 1);
        return [gameData.index, nextPossibleStates[stateIndex]];
    }

    getRandomOptimalNextState(){
        const currentNimSum = this.getNimSum();
        // console.log(currentNimSum);
        if(currentNimSum === 0) return this.getRandomNextState();
        const shuffledGames = shuffled(this.#movableGames);
        // console.log(shuffledGames);
        for(const { index, game } of shuffledGames){
            const nimber = this.#nimberAnalyzer.calculateNimber(game);
            const nextGames = game.getNextPossibleGames();
            const nextStates = game.getNextPossibleStates();
            for(let i = 0; i < nextStates.length; i++){
                const nextNimber = this.#nimberAnalyzer.calculateNimber(nextGames[i]);
                if((currentNimSum ^ nimber ^ nextNimber) === 0){
                    return [index, nextStates[i]];
                }
            }
        }
        return null;
    }
}

export { GameCombinations };