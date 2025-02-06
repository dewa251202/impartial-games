import { ImpartialGame } from "./impartial.js";

/**
 * @augments ImpartialGame
 */
class SubtractionGame extends ImpartialGame {
    #position;
    #subtractionSetGenerator;

    /**
     * 
     * @param {number[]} position Position of current game represented by an array of non-negative integers.\
     * - For Nim and the likes (subtract a square): only a single element in the array.
     * - For Chomp and the likes (nim_k): can be more than one elements.
     * @param {Function} subtractionSetGenerator Generator for subtraction set.
     * Constraints:
     * - the array is sorted in ascending order (for performance),
     * - the elements are unique (for performance), and
     * - all elements are positive integers (avoid getting infinite loop).
     */
    constructor(position, subtractionSetGenerator){
        super();
        this.#position = position;
        this.#subtractionSetGenerator = subtractionSetGenerator;
    }

    /**
     * Subtract this position with an array of numbers
     * @param {number[]} value The array
     * @returns Returns `true` if the subtraction is successful. Returns `false` otherwise.
     */
    #subtractWith(value){
        return this.#subtractArray(this.#position, value);
    }
    
    /**
     * Subtract two arrays of the same length.
     * @param {number[]} a Array to be subtracted from a second array
     * @param {number[]} b The second array
     * @returns `true` if the subtraction is valid, `false` otherwise
     */
    #subtractArray(a, b){
        if(!this.#isValidSubtraction(a, b)) return false;
        // console.log(a, b);
        b.forEach((v, i) => a[i] -= v);
        return true;
    }

    /**
     * Simply check if it's a valid subtraction or not. 
     * @param {number[]} value The second array to subtract with this position.
     * @returns Returns `true` if it's a valid move and `false` otherwise.
     */
    isValidMove(value){
        return this.#subtractionSetGenerator(this.#position).find(sub => sub.every((v, i) => v === value[i]));
    }

    /**
     * Check if it's a valid subtraction. Valid subtraction means the array length is the same and all elements of the resulting array
     * are non-negative.
     * @param {number[]} a The first array
     * @param {number[]} b The second array
     * @returns Returns `true` if `a - b` is valid. Otherwise, returns `false`.
     */
    #isValidSubtraction(a, b){
        if(a.length !== b.length){
            console.warn(`Length of operands doesn't match (${a.length} != ${b.length})`);
            return false;
        }
        // console.warn(`b[${i}] = ${b[i]} is greater than a[${i}] = ${v}`);
        return a.every((v, i) => b[i] <= v);
    }

    /**
     * Move to the next position by subtracting it.
     * @param {number[]} value Element of subtraction set. In other words, the move is always a valid move.
     * @returns {SubtractionGame[]} New games "spawned" after doing the move. Always empty.
     */
    moveBy(value){
        this.#subtractWith(value);
        return [this];
    }

    /**
     * 
     * @returns {SubtractionGame[][]} 
     */
    getNextPossibleGames(){
        return this.getNextPossiblePositions().map(([pos]) => [new SubtractionGame(pos, this.#subtractionSetGenerator)]);
    }
    
    /**
     * 
     * @returns {number[][]}
     */
    getNextPossiblePositions(){
        const positions = [];
        for(const value of this.#subtractionSetGenerator(this.#position)){
            const newPosition = [...this.#position];
            if(this.#subtractArray(newPosition, value)){
                positions.push([newPosition]);
            }
            else break;
        }
        return positions;
    }

    getPosition(){
        return this.#position;
    }

    hash(){
        return this.#position.toString();
    }
}

class ScalarSubtractionGame extends SubtractionGame {
    #subtractionSetGenerator;

    constructor(value, subtractionSetGenerator){
        super([value], function*([value]){
            for(const val of subtractionSetGenerator(value)){
                yield [val];
            }
        });
        this.#subtractionSetGenerator = subtractionSetGenerator;
    }

    isValidMove(value){
        return Array.from(this.#subtractionSetGenerator(this.getPosition())).includes(value);
    }

    moveBy(value){
        return super.moveBy([value]);
    }

    getPosition(){
        return super.getPosition()[0];
    }
}

export { ScalarSubtractionGame };