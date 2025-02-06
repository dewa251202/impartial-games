import { ImpartialGame } from "./impartial.js";

class GameMap {
    #map;

    constructor(){
        this.#map = new Map();
    }

    get(game){
        return this.#map.get(game.hash());
    }

    set(game, value){
        this.#map.set(game.hash(), value);
    }

    has(game){
        return this.#map.has(game.hash());
    }
}

class NimberAnalyzer {
    #games;
    #nextPossibleGames;
    #nimbers;

    /**
     * 
     * @param {ImpartialGame[]} games 
     */
    constructor(games){
        this.#games = games ?? [];
        this.#nextPossibleGames = new GameMap();
        this.#nimbers = new GameMap();
        this.#games.forEach(game => this.calculateNimber(game));
        // console.log(this.#nimbers);
    }

    /**
     * Returns the nimber (Grundy value) of a game
     * @param {ImpartialGame} game 
     * @returns {number}
     */
    calculateNimber(game){
        const stack = [game];
        const order = [];
        // console.log(game);
        while(stack.length > 0){
            const top = stack.pop();
            order.push(top);
            const nextPossibleGames = top.getNextPossibleGames();
            if(!this.#nextPossibleGames.has(top)){
                this.#nextPossibleGames.set(top, nextPossibleGames);
            }
            nextPossibleGames.forEach(gs => gs.forEach(g => stack.push(g)));
        }

        while(order.length > 0){
            const top = order.pop();
            if(this.#nimbers.has(top)) continue;
            const games = this.#nextPossibleGames.get(top);
            const nimber = mex(games.map(gs => 
                gs.map(g => this.#nimbers.get(g)).reduce((pv, cv) => pv ^ cv, 0)
            ));
            this.#nimbers.set(top, nimber);
        }

        return this.#nimbers.get(game);
    }
}

/**
 * Returns the smallest non-negative integer that doesn't exist in the set
 * @param {number[]} numbers - the set
 * @returns smallest non-negative integer not in the set
 */
function mex(numbers){
    let result = 0;
    numbers.sort((a, b) => a - b);
    for(const number of numbers){
        if(number === result) result++;
    }
    return result;
}

export { NimberAnalyzer };