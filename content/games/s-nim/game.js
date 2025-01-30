import { Piles } from "view/pile.js";
import { BaseGameState, SinglePileNim } from "base-game";
import { Controller } from "controller";
import { ArrayInputBuilder } from "input/array.js";

class SNim extends SinglePileNim {
    #predefinedSet;

    /**
     * 
     * @param {number} itemCount 
     * @param {number[]} predefinedSet 
     */
    constructor(itemCount, predefinedSet){
        super(itemCount);
        this.#predefinedSet = predefinedSet;
    }

    /**
     * 
     * @param {number} removedItemCount 
     * @returns 
     */
    isValidMove(removedItemCount){
        return this.#predefinedSet.includes(removedItemCount);
    }

    getNextPossibleGames(){
        return this.getNextPossiblePositions().map(itemCount => new SNim(itemCount, this.#predefinedSet));
    }

    getNextPossiblePositions(){
        const nextPossiblePositions = [];
        for(const removedItemCount of this.#predefinedSet){
            if(0 <= this.currentItemCount - removedItemCount){
                nextPossiblePositions.push(this.currentItemCount - removedItemCount);
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
     * @param {number[]} predefinedSet 
     */
    constructor(piles, predefinedSet){
        super();
        piles ??= [];
        predefinedSet ??= [];
        if(piles.length === 0) console.warn('There are no piles.');
        const games = piles.map(itemCount => new SNim(itemCount, predefinedSet));
        this.setGames(games);
    }
}

const pileInput = new ArrayInputBuilder()
    .setCaption('Enter the number of beads in each heap:')
    .setDefaultValue([2, 3, 7, 12])
    .setArrayLengthDesc('l', 'number of heaps')
    .setArrayDesc('h', 'i', 'number of beads in the i-th heap')
    .setArrayLengthBound(1, 10)
    .setArrayValueBound(0, 15)
    .build();
const setInput = new ArrayInputBuilder()
    .setCaption('Enter set elements:')
    .setArrayLengthDesc('k', 'number of positions to evaluate')
    .setDefaultValue([2, 5])
    .setArrayDesc('s', 'i', 'element of the set')
    .setArrayLengthBound(1, 10)
    .setArrayValueBound(1, 15)
    .build();
const gameState = new GameState(pileInput.defaultValue, setInput.defaultValue);
const board = new Piles(gameState);
new Controller([pileInput, setInput], board);

export { GameState };