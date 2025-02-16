import { BaseGameState, ImpartialGame } from "base-game";
import { Controller } from "controller";
import { Cells } from "./cell.js";
import { Input } from "./input.js";

class MainBatuLagi extends ImpartialGame {
    #position;
    #nextCells;

    /**
     * 
     * @param {number} position 
     * @param {number[][]} nextCells 
     */
    constructor(position, nextCells){
        super();
        this.#position = position;
        this.#nextCells = nextCells;
    }

    moveBy(nextPosition){
        this.#position = nextPosition;
        return [this];
    }

    getNextPossibleGames(){
        return this.getNextPossiblePositions().map(([pos]) => [new MainBatuLagi(pos, this.#nextCells)]);
    }

    getNextPossiblePositions(){
        if(this.#position === 0) return [];
        const positions = [];
        for(let i = this.#nextCells[this.#position][0]; i <= this.#nextCells[this.#position][1]; i++){
            positions.push([i]);
        }
        return positions;
    }

    isValidMove(nextPosition){
        if(this.#position === 0) return false;
        return this.#nextCells[this.#position][0] <= nextPosition && nextPosition <= this.#nextCells[this.#position][1];
    }

    getPosition(){
        return this.#position;
    }

    hash(){
        return this.#position;
    }
}

class GameState extends BaseGameState {
    #gameIndices;
    #nextCells;
    #games;

    /**
     * 
     * @param {number[][]} nextCells 
     * @param {number[]} positions
     */
    constructor([n, _m, nextCells, positions]){
        super();
        this.#gameIndices = new Array(n);

        this.#nextCells = nextCells.map(([ai, bi]) => [ai - 1, bi - 1]);
        this.#nextCells.unshift(null);
        this.#games = positions.map(ck => new MainBatuLagi(ck - 1, this.#nextCells));
        this.setGames(this.#games);
    }

    getGameIndices(){
        for(let i = 0; i < this.#gameIndices.length; i++){
            this.#gameIndices[i] = [];
        }

        this.#games.forEach((game, index) => {
            this.#gameIndices[game.getPosition()].push(index);
        });
        return this.#gameIndices;
    }

    getNextCellBound(cellIndex){
        if(!(0 <= cellIndex && cellIndex < this.#nextCells.length)) return null;
        return this.#nextCells[cellIndex];
    }
}

const input = new Input([1, 15], [1, 20]);
const board = new Cells();
new Controller([input], board);

export { GameState };