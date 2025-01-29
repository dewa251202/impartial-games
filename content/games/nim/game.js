import { BaseGameState, SinglePileNim } from "base-game";
import { Controller } from "controller";
import { Player } from "player";
import { Piles } from "view/pile.js";
import { ArrayInputBuilder } from "input/array.js";

class Nim extends SinglePileNim {}

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
const gameState = new GameState(pileInput.defaultValue);
const board = new Piles(gameState);
new Controller([pileInput], board);

export { GameState };