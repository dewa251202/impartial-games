import { getRandomInt, shuffled } from "common";
import { NimberAnalyzer } from "./nimber.js";

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
            .reduce((accumulator, currentValue) => accumulator ^ currentValue, 0);
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
    isValidMove(gameIndex, moveData){
       return this.#games[gameIndex].isValidMove(moveData);
    }
    
    /**
     * 
     * @param {number} gameIndex 
     * @param {number} moveData 
     * @returns {boolean}
    */
    makeMove(gameIndex, moveData){
        const game = this.#games[gameIndex];
        const moveMade = game.makeMove(moveData);
        if(moveMade && !game.canMove()){
            const index = this.#movableGames.findIndex(movableGame => movableGame.game === game);
            this.#movableGames.splice(index, 1);
        }
        return moveMade;
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

    getRandomNextPosition(){
        if(this.#movableGames.length === 0) return null;
        const gameIndex = getRandomInt(0, this.#movableGames.length - 1);
        const gameData = this.#movableGames[gameIndex];
        const nextPossiblePositions = gameData.game.getNextPossiblePositions();
        const stateIndex = getRandomInt(0, nextPossiblePositions.length - 1);
        return [gameData.index, nextPossiblePositions[stateIndex]];
    }

    getRandomOptimalNextPosition(){
        const currentNimSum = this.getNimSum();
        // console.log(currentNimSum);
        if(currentNimSum === 0) return this.getRandomNextPosition();
        const shuffledGames = shuffled(this.#movableGames);
        // console.log(shuffledGames);
        for(const { index, game } of shuffledGames){
            const nimber = this.#nimberAnalyzer.calculateNimber(game);
            const nextGames = game.getNextPossibleGames();
            const nextPositions = game.getNextPossiblePositions();
            for(let i = 0; i < nextPositions.length; i++){
                const nextNimber = this.#nimberAnalyzer.calculateNimber(nextGames[i]);
                if((currentNimSum ^ nimber ^ nextNimber) === 0){
                    return [index, nextPositions[i]];
                }
            }
        }
        return null;
    }
}

export { GameCombinations };