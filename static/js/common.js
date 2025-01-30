/**
 * @typedef {import("input/array.js").ArrayInput} InputStrategy
 * @typedef {import("view/pile.js").Piles} Board
 */

const DEFAULT_PILES = [3, 5, 4];

const InputState = {
    Invalid: 0,
    Valid: 1,
};

/**
 * Return a normally distributed random integer within a range using Box-Muller transform
 * @param {num} min 
 * @param {num} max 
 * @returns 
 */
function getGaussianRandomInt(min, max){
    const mu = (min + max)/2;
    const sigma = (max - min)/2;
    let result;
    while(!result || !(min <= result && result <= max)){
        const pi = 2 * Math.PI * Math.random();
        const R = Math.sqrt(-2 * Math.log(Math.random()));
        const x = R * Math.cos(pi);
        result = x * mu + sigma;
    }
    return Math.round(result);
}

/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
function getUniformRandomInt(min, max){
    return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
function getRandomInt(min, max){
    if(min > max) return Number.NaN;
    if(min === max) return min;
    // return getUniformRandomInt(min, max);
    return getGaussianRandomInt(min, max);
}

/**
 * 
 * @param {string} str 
 * @returns 
 */
function toKebabCase(str){
    return str.toLowerCase().replaceAll(/\s/gi, '-');
}

/**
 * 
 * @param  {...HTMLElement} elements 
 * @returns 
 */
function div(...elements){
    const div = document.createElement('div');
    for(const element of elements) div.appendChild(element);
    return div;
}

/**
 * Shuffle a copy of the array using Fisher-Yates shuffle and returns it
 * @param {any[]} array 
 */
function shuffled(array){
    const copiedArray = [...array];
    for(let j = copiedArray.length - 1; j > 0; j--){
        let i = getUniformRandomInt(0, j - 1);
        [copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]];
    }
    return copiedArray;
}

export { DEFAULT_PILES, InputState }
export { getRandomInt, toKebabCase, div, shuffled };