import { GameCombinations, MultiplePilesGame } from "base-game";

class Game extends MultiplePilesGame {
    constructor(piles, firstPlayer, secondPlayer){
        super(piles, firstPlayer, secondPlayer);
    }
}

export { Game };