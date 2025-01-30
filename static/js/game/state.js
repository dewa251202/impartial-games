import { GameCombinations } from "./combinations.js";
import { Player } from "player";
import { ImpartialGame } from "./impartial.js";

class BaseGameState {
    #turnIndex;
    #combinedGames;
    players;

    /**
     * 
     * @param {Player} firstPlayer 
     * @param {Player} secondPlayer 
     */
    constructor(firstPlayer, secondPlayer){
        firstPlayer ??= document.getElementById('first-player-config').getPlayer();
        secondPlayer ??= document.getElementById('second-player-config').getPlayer();
        this.#turnIndex = 0;
        this.players = [firstPlayer, secondPlayer];
    }

    /**
     * 
     * @param {ImpartialGame[]} games 
     */
    setGames(games){
        this.#combinedGames = new GameCombinations(games);
    }

    getCurrentPlayer(){
        return this.players[this.#turnIndex % 2];
    }

    getNextPlayer(){
        return this.getCurrentPlayer();
    }

    getLastPlayer(){
        return this.players[(this.#turnIndex + 1) % 2];
    }

    getPrevPlayer(){
        return this.getLastPlayer();
    }

    getGames(){
        return this.#combinedGames.getGames();
    }

    isValidMove(pileIndex, removedItemCount){
        return this.#combinedGames.isValidMove(pileIndex, removedItemCount);
    }

    makeMove(pileIndex, removedItemCount){
        const moveMade = this.#combinedGames.makeMove(pileIndex, removedItemCount);
        if(moveMade) this.#turnIndex++;
        return moveMade;
    }

    canMove(){
        return this.#combinedGames.canMove();
    }

    getRandomNextPosition(){
        return this.#combinedGames.getRandomNextPosition();
    }

    getRandomOptimalNextPosition(){
        return this.#combinedGames.getRandomOptimalNextPosition();
    }

    isWinningGame(){
        return this.#combinedGames.isWinningGame();
    }
}

export { BaseGameState };