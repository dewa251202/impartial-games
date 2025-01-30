import { ImpartialGame } from "./impartial.js";

class MainBatuLagi extends ImpartialGame {
    #nextCellsBound;
    #currentCell;

    /**
     * 
     * @param {number[][]} nextCellBound 
     * @param {number} currentCell 
     */
    constructor(nextCellBound, currentCell){
        super();
        this.#nextCellsBound = nextCellBound;
        this.#currentCell = currentCell;
    }

    /**
     * 
     * @param {number} nextCell 
     */
    moveToNextPosition(nextCell){
        this.#currentCell = nextCell;
    }

    /**
     * 
     * @param {number} nextCell 
     * @returns 
     */
    isValidMove(nextCell){
        const [a, b] = this.#nextCellsBound[this.#currentCell];
        return (a <= nextCell && nextCell <= b);
    }

    getNextPossibleGames(){
        return this.getNextPossiblePositions()
            .map(cell => new MainBatuLagi(this.#nextCellsBound, cell));
    }

    getNextPossiblePositions(){
        const [a, b] = this.#nextCellsBound[this.#currentCell];
        const nextPossiblePositions = [];
        for(let j = a; j <= b; j++){
            nextPossiblePositions.push(j);
        }
        return nextPossiblePositions;
    }

    hash(){
        return this.#currentCell;
    }
}

export { MainBatuLagi };