class NimberAnalyzer {
    #games;
    #nextPossibleGames;
    #nimbers;

    /**
     * 
     * @param {SinglePileNim[]} games 
     */
    constructor(games){
        this.#games = games ?? [];
        this.#nextPossibleGames = new Map();
        this.#nimbers = new Map();
        this.#games.forEach(game => this.calculateNimber(game));
        // console.log(this.#nimbers);
    }

    /**
     * Returns the nimber (Grundy value) of a game
     * @param {SinglePileNim} game 
     * @returns {number}
     */
    calculateNimber(game){
        const stack = [game];
        const order = [];
        while(stack.length > 0){
            const top = stack.pop();
            order.push(top);
            const nextPossibleGames = top.getNextPossibleGames();
            if(!this.#nextPossibleGames.has(top.hash())){
                this.#nextPossibleGames.set(top.hash(), nextPossibleGames);
            }
            nextPossibleGames.forEach(g => stack.push(g));
        }

        while(order.length > 0){
            const top = order.pop();
            if(this.#nimbers.has(top.hash())) continue;
            const games = this.#nextPossibleGames.get(top.hash());
            const nimber = mex(games.map(g => this.#nimbers.get(g.hash())));
            this.#nimbers.set(top.hash(), nimber);
        }

        return this.#nimbers.get(game.hash());
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