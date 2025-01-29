import { GameCombinations } from "./combinations.js";
import { HumanPlayer, PcPlayer, Player } from "player";
import { ImpartialGame } from "./impartial.js";
import { DEFAULT_FIRST_PLAYER, DEFAULT_SECOND_PLAYER } from "common";

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
        firstPlayer ??= DEFAULT_FIRST_PLAYER;
        secondPlayer ??= DEFAULT_SECOND_PLAYER;
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

    getRandomNextState(){
        return this.#combinedGames.getRandomNextState();
    }

    getRandomOptimalNextState(){
        return this.#combinedGames.getRandomOptimalNextState();
    }

    isWinningGame(){
        return this.#combinedGames.isWinningGame();
    }
}

export { BaseGameState };