class ImpartialGame {
    /**
     * 
     * @param {any} moveData 
     * @returns 
     */
    makeMove(moveData){
        if(!this.isValidMove(moveData)) return false;
        this.moveToNextPosition(moveData);
        return true;
    }

    canMove(){
        return this.getNextPossiblePositions().length > 0;
    }
}

export { ImpartialGame };