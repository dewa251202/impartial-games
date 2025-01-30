import { BaseGameState, SinglePileNim } from "base-game";
import { Controller } from "controller";
import { Player } from "player";
import { Piles } from "view/pile.js";
import { ArrayInputBuilder } from "input/array.js";

class SubtractASquare extends SinglePileNim {
    /**
     * 
     * @param {number} itemCount 
     */
    constructor(itemCount){
        super(itemCount);
    }

    /**
     * 
     * @param {number} removedItemCount 
     */
    isValidMove(removedItemCount){
        for(let i = 1; i * i <= removedItemCount; i++){
            if(removedItemCount === i * i){
                return true;
            }
        }
        return false;
    }

    getNextPossibleGames(){
        return this.getNextPossiblePositions().map(itemCount => new SubtractASquare(itemCount));
    }

    getNextPossiblePositions(){
        const nextPossiblePositions = [];
        for(let i = 1; i * i <= this.currentItemCount; i++){
            nextPossiblePositions.push(this.currentItemCount - i * i);
        }
        return nextPossiblePositions;
    }

    hash(){
        return this.currentItemCount;
    }
}

class GameState extends BaseGameState {
    /**
     * 
     * @param {number[]} piles 
     * @param {Player} [firstPlayer] 
     * @param {Player} [secondPlayer] 
     */
    constructor(piles){
        super();
        piles ??= [];
        if(piles.length === 0) console.warn('There are no piles.');
        const games = piles.map(itemCount => new SubtractASquare(itemCount));
        this.setGames(games);
    }
}

const pileInput = new ArrayInputBuilder()
    .setCaption('Enter the number of items in each pile:')
    .setDefaultValue([7, 10, 12, 25])
    .setArrayLengthDesc('N', 'number of piles')
    .setArrayDesc('P', 'i', 'number of items in the i-th pile')
    .setArrayLengthBound(1, 10)
    .setArrayValueBound(0, 15)
    .build();
const gameState = new GameState(pileInput.defaultValue);
const board = new Piles(gameState);
new Controller([pileInput], board);

export { GameState };