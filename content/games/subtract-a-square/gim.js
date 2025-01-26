import { SinglePileNim } from "base-game";

class SubtractASquare extends SinglePileNim {
    /**
     * 
     * @param {number} removedItemCount 
     * @returns 
     */
    isValidMove(removedItemCount){
        for(let i = 1; i * i <= removedItemCount; i++){
            if(i * i === removedItemCount) return true;
        }
        return false;
    }

    getNextPossibleStates(){
        const nextPossibleStates = [];
        for(let i = 1; i * i <= this.currentItemCount; i++){
            nextPossibleStates.push(this.currentItemCount - i * i);
        }
        return nextPossibleStates;
    }
}