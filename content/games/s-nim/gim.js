import { SinglePileNim } from "base-game";

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