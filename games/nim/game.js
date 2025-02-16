import { BaseGameState, ScalarSubtractionGame } from "base-game";
import { Controller } from "controller";
import { Player } from "player";
import { Piles, RemoveTop } from "view/pile.js";
import { ArrayInputBuilder } from "input/array.js";

class Nim extends ScalarSubtractionGame {
    /**
     * 
     * @param {number} itemCount 
     */
    constructor(itemCount){
        super(itemCount, function*(currentItemCount){
            for(let i = 1; i <= currentItemCount; i++){
                yield i;
            }
        });
    }

    isValidMove(value){
        return 1 <= value && value <= this.getPosition();
    }

    calculateNimber(){
        return this.getPosition();
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
        const games = piles.map(itemCount => new Nim(itemCount));
        this.setGames(games);
    }
}

const pileInput = new ArrayInputBuilder()
    .setCaption('Enter the number of items in each pile:')
    .setDefaultValue([3, 5, 4])
    .setArrayLengthDesc('N', 'number of piles')
    .setArrayDesc('P', 'i', 'number of items in the i-th pile')
    .setArrayLengthBound(1, 10)
    .setArrayValueBound(0, 15)
    .build();
const board = new Piles(new RemoveTop());
new Controller([pileInput], board);

export { GameState };