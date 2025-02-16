import { getRandomInt, shuffled } from "common";
import { NimberAnalyzer } from "./nimber.js";
import { ImpartialGame } from "./impartial.js";

class GameCombinations {
    #games;
    #movableGames;
    #nimberAnalyzer;

    /**
     * 
     * @param {ImpartialGame[]} games 
     */
    constructor(games){
        this.#games = games ?? [];
        this.#movableGames = this.#games
            .map((game, index) => ({ index, game }))
            .filter(data => data.game.canMove());
        this.#nimberAnalyzer = new NimberAnalyzer(this.#games);
    }

    getNimSum(){
        return this.#games
            .map(game => this.#nimberAnalyzer.calculateNimber(game))
            .reduce((pv, cv) => pv ^ cv, 0);
    }

    isWinningGame(){
        return this.getNimSum() > 0;
    }

    isLosingGame(){
        return !this.isWinningGame();
    }

    /**
     * 
     * @param {number} gameIndex 
     * @param {number} moveData 
     * @returns {boolean}
    */
    isValidMove(gameIndex, ...moveData){
       return this.#games[gameIndex].isValidMove(...moveData);
    }
    
    /**
     * 
     * @param {number} gameIndex 
     * @param {number} moveData 
     * @returns {boolean}
    */
    makeMove(gameIndex, ...moveData){
        const game = this.#games[gameIndex];
        const nextGames = game.makeMove(...moveData);
        if(nextGames !== null){
            const index = this.#games.findIndex(g => g === game);
            this.#games.splice(index, 1, ...nextGames);
            this.#movableGames = this.#games
                .map((game, index) => ({ index, game }))
                .filter(data => data.game.canMove());
            return true;
        }
        return false;
    }

    getGames(){
        return this.#games;
    }

    /**
     * 
     * @param {number} index 
     * @returns 
     */
    getGame(index){
        return this.#games[index];
    }

    canMove(){
        return this.#movableGames.length > 0;
    }

    getRandomNextGame(){
        if(this.#movableGames.length === 0) return null;
        const gameIndex = getRandomInt(0, this.#movableGames.length - 1);
        const gameData = this.#movableGames[gameIndex];
        const nextPossibleGames = gameData.game.getNextPossibleGames();
        // console.log(gameData, nextPossibleGames);
        const nextGames = nextPossibleGames[getRandomInt(0, nextPossibleGames.length - 1)];
        return [gameData.index, nextGames];
    }

    getRandomOptimalNextGame(){
        const currentNimSum = this.getNimSum();
        // console.log(currentNimSum);
        if(currentNimSum === 0) return this.getRandomNextGame();
        const shuffledGames = shuffled(this.#movableGames);
        // console.log(shuffledGames);
        for(const { index, game } of shuffledGames){
            const targetNimber = this.#nimberAnalyzer.calculateNimber(game) ^ currentNimSum;
            const nextGames = game.getNextPossibleGames();
            for(let i = 0; i < nextGames.length; i++){
                const nextNimber = nextGames[i]
                    .map(ng => this.#nimberAnalyzer.calculateNimber(ng))
                    .reduce((pv, cv) => pv ^ cv, 0);
                if(targetNimber === nextNimber){
                    return [index, nextGames[i]];
                }
            }
        }
        return null;
    }
}

export { GameCombinations };