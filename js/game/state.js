import { GameCombinations } from "./combinations.js";
import { Player } from "player";
import { ImpartialGame } from "./impartial.js";

class BaseGameState {
    #turnIndex;
    #combinedGames;
    #players;

    constructor(){
        this.#turnIndex = 0;
    }

    getTurnIndex(){
        return this.#turnIndex;
    }
    
    /**
     * 
     * @param {Player} firstPlayer 
     * @param {Player} secondPlayer 
     */
    setPlayers(firstPlayer, secondPlayer){
        this.#players = [firstPlayer, secondPlayer];
    }

    /**
     * 
     * @param {ImpartialGame[]} games 
     */
    setGames(games){
        this.#combinedGames = new GameCombinations(games);
    }

    getCurrentPlayer(){
        return this.#players[this.#turnIndex % 2];
    }

    getNextPlayer(){
        return this.getCurrentPlayer();
    }

    getLastPlayer(){
        return this.#players[(this.#turnIndex + 1) % 2];
    }

    getPrevPlayer(){
        return this.getLastPlayer();
    }

    getGames(){
        return this.#combinedGames.getGames();
    }

    isValidMove(gameIndex, ...moveData){
        return this.#combinedGames.isValidMove(gameIndex, ...moveData);
    }

    makeMove(gameIndex, ...moveData){
        const moveMade = this.#combinedGames.makeMove(gameIndex, ...moveData);
        if(moveMade) this.#turnIndex++;
        return moveMade;
    }

    canMove(){
        return this.#combinedGames.canMove();
    }

    getRandomNextGame(){
        return this.#combinedGames.getRandomNextGame();
    }

    getRandomOptimalNextGame(){
        return this.#combinedGames.getRandomOptimalNextGame();
    }

    isWinningGame(){
        return this.#combinedGames.isWinningGame();
    }
}

export { BaseGameState };