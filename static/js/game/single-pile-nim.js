import { ImpartialGame } from "./impartial.js";

class SinglePileNim extends ImpartialGame {
    currentItemCount;

    /**
     * 
     * @param {number} itemCount 
     */
    constructor(itemCount){
        super();
        this.currentItemCount = itemCount;
    }

    /**
     * 
     * @param {number} removedItemCount 
     */
    moveToNextState(removedItemCount){
        this.currentItemCount -= removedItemCount;
    }

    /**
     * 
     * @param {number} removedItemCount 
     * @returns 
     */
    isValidMove(removedItemCount){
        return 1 <= removedItemCount && removedItemCount <= this.currentItemCount;
    }

    getNextPossibleGames(){
        return this.getNextPossibleStates().map(itemCount => new SinglePileNim(itemCount));
    }

    getNextPossibleStates(){
        const nextPossibleStates = [];
        for(let i = 0; i < this.currentItemCount; i++){
            nextPossibleStates.push(i);
        }
        return nextPossibleStates;
    }

    hash(){
        return this.currentItemCount;
    }
}

export { SinglePileNim };