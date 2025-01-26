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

export { MultiplePilesGame };