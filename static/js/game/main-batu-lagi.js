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
    moveToNextState(nextCell){
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
        return this.getNextPossibleStates()
            .map(cell => new MainBatuLagi(this.#nextCellsBound, cell));
    }

    getNextPossibleStates(){
        const [a, b] = this.#nextCellsBound[this.#currentCell];
        const nextPossibleStates = [];
        for(let j = a; j <= b; j++){
            nextPossibleStates.push(j);
        }
        return nextPossibleStates;
    }

    hash(){
        return this.#currentCell;
    }
}

export { MainBatuLagi };