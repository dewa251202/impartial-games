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
    moveToNextPosition(removedItemCount){
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
        return this.getNextPossiblePositions().map(itemCount => new SinglePileNim(itemCount));
    }

    getNextPossiblePositions(){
        const nextPossiblePositions = [];
        for(let i = 0; i < this.currentItemCount; i++){
            nextPossiblePositions.push(i);
        }
        return nextPossiblePositions;
    }

    hash(){
        return this.currentItemCount;
    }
}

export { SinglePileNim };