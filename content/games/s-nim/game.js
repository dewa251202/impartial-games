import { MultiplePilesGame, SinglePileNim } from "base-game";

class Game extends MultiplePilesGame {}

class SNim extends SinglePileNim {
    #set;

    /**
     * 
     * @param {number[]} set 
     */
    constructor(set){
        this.#set = set;
    }

    /**
     * 
     * @param {number} removedItemCount 
     */
    isValidMove(removedItemCount){
        return this.#set.includes(removedItemCount);
    }
}

export { Game };