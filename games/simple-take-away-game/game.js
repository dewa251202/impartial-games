import { Piles, RemoveTop } from "view/pile.js";
import { BaseGameState, ScalarSubtractionGame } from "base-game";
import { Controller } from "controller";
import { ArrayInputBuilder } from "input/array.js";
import { NumberInputBuilder } from "input/number.js";

class SimpleTakeAwayGame extends ScalarSubtractionGame {
    #maxItemsToRemove;

    /**
     * 
     * @param {number} itemCount 
     */
    constructor(itemCount, maxItemsToRemove){
        super(itemCount, function*(){
            for(let i = 1; i <= maxItemsToRemove; i++){
                yield i;
            }
        });
        this.#maxItemsToRemove = maxItemsToRemove;
    }

    isValidMove(value){
        return 1 <= value && value <= this.#maxItemsToRemove;
    }
}

class GameState extends BaseGameState {
    /**
     * 
     * @param {number[]} piles 
     * @param {number} maxItemsToRemove 
     */
    constructor(piles, maxItemsToRemove){
        super();
        piles ??= [];
        maxItemsToRemove ??= 1;
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
const board = new Piles(new RemoveTop());
new Controller([pileInput, numberInput], board);

export { GameState };