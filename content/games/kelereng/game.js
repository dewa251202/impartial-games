import { MultiplePilesGame } from "base-game";

class Game extends MultiplePilesGame {
    constructor(piles, firstPlayer, secondPlayer){
        super(piles, firstPlayer, secondPlayer);
    }

    isValidMove(pileIndex, itemIndex){
        const itemCount = this.getItemCount(pileIndex);
        if(itemIndex === undefined || !(0 <= itemIndex && itemIndex < itemCount)){
            return false;
        }
        return (itemCount - itemIndex <= 6);
    }
}

export { Game };