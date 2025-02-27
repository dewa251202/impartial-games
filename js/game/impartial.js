class ImpartialGame {
    /**
     * Make a move to a position.
     * @param {any[]} moveData Data of the move.\
     * For example:
     * - number of items to be removed (nim),
     * - edge to be cut (hackenbush), or
     * - position in the bar of chocolate (chomp).
     * @returns {(null | ImpartialGame[])} Returns `null` if it's not a valid move. If it's a valid move, returns array of games
     * representing new created games from the move. If the array is not empty, then the game is take-and-break type.
     */
    makeMove(...moveData){
        if(!this.isValidMove(...moveData)) return null;
        return this.moveBy(...moveData);
    }

    /**
     * Check if the player can make a move in this game.
     * @returns {boolean}
     */
    canMove(){
        return this.getNextPossiblePositions().length > 0;
    }
    
    /**
     * Check if the move is valid.
     * @param {any[]} _moveData Data of the move.
     * For example:
     * - number of items to be removed (nim),
     * - edge to be cut (hackenbush), or
     * - position in the bar of chocolate (chomp).
     * @abstract
     * @returns {boolean}
     */
    isValidMove(..._moveData){
        throw new Error("Unimplemented");
    }

    /**
     * Move this game no the next position
     * @param {any[]} _moveData 
     * For example:
     * - number of items to be removed (nim),
     * - edge to be cut (hackenbush), or
     * - position in the bar of chocolate (chomp).
     * @abstract
     * @returns {ImpartialGame[]}
     */
    moveBy(..._moveData){
        throw new Error("Unimplemented");
    }

    /**
     * Get next possible games for this game. Used to calculate the nimber.
     * @abstract
     * @returns {ImpartialGame[][]} 
     */
    getNextPossibleGames(){
        throw new Error("Unimplemented");
    }
    
    /**
     * Get next possible positions for this game.
     * @returns {any[][]} 
     */
    getNextPossiblePositions(){
        throw new Error("Unimplemented");
    }

    /**
     * Hash of this game. Used to calculate nimber.\
     * For example
     * - Nim and subtract a square could just return current position.
     * - General subtraction games could return string representation of current position.
     * - Hackenbush could return hash of the tree.
     * @returns {number}
     */
    hash(){
        throw new Error("Unimplemented");
    }
}

export { ImpartialGame };