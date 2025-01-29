class ImpartialGame {
    /**
     * 
     * @param {any} moveData 
     * @returns 
     */
    makeMove(moveData){
        if(!this.isValidMove(moveData)) return false;
        this.moveToNextState(moveData);
        return true;
    }

    canMove(){
        return this.getNextPossibleStates().length > 0;
    }
}

export { ImpartialGame };