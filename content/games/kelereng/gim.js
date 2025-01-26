import { SinglePileNim } from "base-game";

class Kelereng extends SinglePileNim {
    #maximumRemovedItems

    /**
     * 
     * @param {number} maximumRemovedItems 
     */
    constructor(maximumRemovedItems){
        this.#maximumRemovedItems = maximumRemovedItems ?? 6;
    }

    /**
     * 
     * @param {number} removedItemCount 
     * @returns 
     */
    isValidMove(removedItemCount){
        return 1 <= removedItemCount && removedItemCount <= this.#maximumRemovedItems;
    }

    getNextPossibleStates(){
        const nextPossibleStates = [];
        for(let i = Math.max(0, this.currentItemCount - this.#maximumRemovedItems); i < this.currentItemCount; i++){
            nextPossibleStates.push(i);
        }
        return nextPossibleStates;
    }
}