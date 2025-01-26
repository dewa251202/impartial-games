const Constants = {
    DEFAULT_PILES: [1, 10]
};

const InputState = {
    Invalid: 0,
    Valid: 1,
};

/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
function getRandomInt(min, max){
    if(min > max) return Number.NaN;
    return min + Math.floor(Math.random() * (max - min + 1));
}

export { Constants, InputState, getRandomInt };