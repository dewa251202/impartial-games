import { BaseGameState, TakeAndBreak } from "base-game";
import { Controller } from "controller";
import { Piles, SplitPile } from "view/pile.js";
import { ArrayInputBuilder } from "input/array.js";

class GrundysGame extends TakeAndBreak {
    /**
     * 
     * @param {number} itemCount 
     */
    constructor(itemCount){
        super(itemCount);
    }

    isValidMove(value){
        const splitStart = this.getPosition() - value;
        const splitEnd = splitStart;
        // console.log(value, this.getPosition());
        if(!super.isValidMove(splitStart, splitEnd)) return false;
        return value != this.getPosition() - value;
    }

    moveBy(value){
        const splitStart = this.getPosition() - value;
        const splitEnd = splitStart;
        return super.moveBy(splitStart, splitEnd);
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
        const games = piles.map(itemCount => new GrundysGame(itemCount));
        this.setGames(games);
    }
}

const pileInput = new ArrayInputBuilder()
    .setCaption('Enter the number of items in each pile:')
    .setDefaultValue([6, 7, 2, 4])
    .setArrayLengthDesc('N', 'number of piles')
    .setArrayDesc('P', 'i', 'number of items in the i-th pile')
    .setArrayLengthBound(1, 10)
    .setArrayValueBound(0, 15)
    .build();
const board = new Piles(new SplitPile());
new Controller([pileInput], board);

export { GameState };