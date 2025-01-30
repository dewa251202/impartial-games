import { Piles } from "view/pile.js";
import { BaseGameState, SinglePileNim } from "base-game";
import { Controller } from "controller";
import { ArrayInputBuilder } from "input/array.js";
import { NumberInputBuilder } from "input/number.js";

class SimpleTakeAwayGame extends SinglePileNim {
    #maxItemsToRemove;

    /**
     * 
     * @param {number} itemCount 
     * @param {number} maxItemsToRemove 
     */
    constructor(itemCount, maxItemsToRemove){
        super(itemCount);
        this.#maxItemsToRemove = maxItemsToRemove;
    }

    /**
     * 
     * @param {number} removedItemCount 
     * @returns 
     */
    isValidMove(removedItemCount){
        return 1 <= removedItemCount && removedItemCount <= this.#maxItemsToRemove;
    }

    getNextPossibleGames(){
        return this.getNextPossiblePositions().map(itemCount => new SimpleTakeAwayGame(itemCount, this.#maxItemsToRemove));
    }

    getNextPossiblePositions(){
        const nextPossiblePositions = [];
        for(let i = 1; i <= this.#maxItemsToRemove; i++){
            if(0 <= this.currentItemCount - i){
                nextPossiblePositions.push(this.currentItemCount - i);
            }
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
     * @param {number[]} maxItemsToRemove 
     */
    constructor(piles, maxItemsToRemove){
        super();
        piles ??= [];
        maxItemsToRemove ??= [];
        if(piles.length === 0) console.warn('There are no piles.');
        const games = piles.map(itemCount => new SimpleTakeAwayGame(itemCount, maxItemsToRemove));
        this.setGames(games);
    }
}

const pileInput = new ArrayInputBuilder()
    .setCaption('Enter the number of items in each pile:')
    .setDefaultValue([4, 7, 5])
    .setArrayLengthDesc('N', 'number of piles')
    .setArrayDesc('P', 'i', 'number of items in the i-th pile')
    .setArrayLengthBound(1, 10)
    .setArrayValueBound(0, 15)
    .build();
const numberInput = new NumberInputBuilder()
    .setCaption('Enter the maximum number of items that can be removed:')
    .setDefaultValue(6)
    .setValueDesc('m', 'Maximum removed items')
    .setValueBound(1, 10)
    .build();
const gameState = new GameState(pileInput.defaultValue, numberInput.defaultValue);
const board = new Piles(gameState);
new Controller([pileInput, numberInput], board);

export { GameState };