import { BaseGameState, ScalarSubtractionGame } from "base-game";
import { Controller } from "controller";
import { Piles, RemoveTop } from "view/pile.js";
import { ArrayInputBuilder } from "input/array.js";

class SubtractASquare extends ScalarSubtractionGame {
    /**
     * 
     * @param {number} itemCount 
     */
    constructor(itemCount){
        super(itemCount, function*(currentItemCount){
            for(let i = 1; i * i <= currentItemCount; i++){
                yield i * i;
            }
        });
    }
}

class GameState extends BaseGameState {
    /**
     * 
     * @param {number[]} piles 
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
    .setDefaultValue([7, 10, 12])
    .setArrayLengthDesc('N', 'number of piles')
    .setArrayDesc('P', 'i', 'number of items in the i-th pile')
    .setArrayLengthBound(1, 10)
    .setArrayValueBound(0, 15)
    .build();
const board = new Piles(new RemoveTop());
new Controller([pileInput], board);

export { GameState };