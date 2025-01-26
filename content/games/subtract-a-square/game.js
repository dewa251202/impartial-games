import { MultiplePilesGame, SinglePileNim } from "base-game";

class Game extends MultiplePilesGame {
    constructor(piles, firstPlayer, secondPlayer){
        super(piles, firstPlayer, secondPlayer);
    }

    isValidMove(pileIndex, itemIndex){
        const itemCount = this.getItemCount(pileIndex);
        if(itemIndex === undefined || !(0 <= itemIndex && itemIndex < itemCount)){
            return false;
        }

        for(let i = 1; i <= 10; i++){
            if(i * i === itemCount - itemIndex){
                return true;
            }
        }
        return false;
    }
}

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
}

export { Game };