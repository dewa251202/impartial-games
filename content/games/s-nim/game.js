import { Piles, RemoveTop } from "view/pile.js";
import { BaseGameState, ScalarSubtractionGame } from "base-game";
import { Controller } from "controller";
import { ArrayInputBuilder } from "input/array.js";

class SNim extends ScalarSubtractionGame {
    #predefinedSet;

    /**
     * 
     * @param {number} itemCount 
     * @param {number[]} predefinedSet 
     */
    constructor(itemCount, predefinedSet){
        super(itemCount, function*(){
            for(const element of predefinedSet){
                yield element;
            }
        });
        this.#predefinedSet = predefinedSet;
    }

    isValidMove(value){
        return this.#predefinedSet.includes(value);
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
        predefinedSet = Array.from(new Set(predefinedSet)).sort((a, b) => a - b);
        console.log(predefinedSet);
        const games = piles.map(itemCount => new SNim(itemCount, predefinedSet));
        this.setGames(games);
    }
}

const pileInput = new ArrayInputBuilder()
    .setCaption('Enter the number of beads in each heap:')
    // .setDefaultValue([2, 3, 7, 12])
    .setDefaultValue([8, 8, 2, 9, 9, 3, 5, 13, 0, 10, 11])
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
const board = new Piles(new RemoveTop());
new Controller([pileInput, setInput], board);

export { GameState };