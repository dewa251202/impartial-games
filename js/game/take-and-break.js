import { ImpartialGame } from "./impartial.js";

/**
 * @augments ImpartialGame
 */
class TakeAndBreak extends ImpartialGame {
    #position;

    /**
     * 
     * @param {number} position Position of current game represented by a non-negative integer.
     * Can be thought to be the number of items in a pile.
     */
    constructor(position){
        super();
        this.#position = position;
    }

    /**
     * Simply checks if the split bound is valid.\
     * For example, there are 5 items represented by `o` and split positions represented by `|`.\
     * `...o|o|o|o|o...`\
     * `___0 1 2 3 4___`\
     * `____1 2 3 4____`\
     * The item index starts from 0 to 4 while the split position starts from 1 to 4.
     * @param {number} splitStart Starting position of the split.
     * @param {number} splitEnd Ending position of the split.
     * @returns Returns `true` if the split bound is valid.
     */
    isValidMove(splitStart, splitEnd){
        return 1 <= splitStart && splitStart <= splitEnd && splitEnd < this.#position;
    }

    moveBy(splitStart, splitEnd){
        const lastPosition = this.#position;
        this.#position = splitStart;
        return [this, new TakeAndBreak(lastPosition - splitEnd)];
    }

    /**
     * 
     * @returns {SubtractionGame[][]} 
     */
    getNextPossibleGames(){
        return this.getNextPossiblePositions().map(([reduced, spawned]) => [
            new TakeAndBreak(reduced),
            new TakeAndBreak(spawned)
        ]);
    }
    
    /**
     * 
     * @returns {number[][]}
     */
    getNextPossiblePositions(){
        const positions = [];
        for(let i = 1; i < this.#position; i++){
            for(let j = i; j < this.#position; j++){
                if(this.isValidMove(i, j)){
                    positions.push([i, this.#position - j]);
                }
            }
        }
        return positions;
    }

    getPosition(){
        return this.#position;
    }

    hash(){
        return this.#position;
    }
}

export { TakeAndBreak };