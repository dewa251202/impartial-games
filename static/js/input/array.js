import { DEFAULT_PILES, getRandomInt, InputState } from "common";
import { InputTextarea, InputConstraints, InputFormat } from "./components.js";

class ArrayInput extends HTMLElement {
    caption;
    #placeholder;
    defaultValue;
    #formatLine;
    #constraints;
    arrayDesc;
    arrayLengthDesc;
    arrayLengthBound;
    arrayValueBound;

    #inputTextarea;
    #inputFormat;
    #inputConstraints;

    constructor(){
        super();
        this.caption = 'Enter one line of integers separated by space:';
        this.defaultValue = DEFAULT_PILES;
        this.arrayDesc = ['A', 'i', 'i-th value of the array'];
        this.arrayLengthDesc = ['N', 'Array length'];
        this.arrayLengthBound = [1, 10];
        this.arrayValueBound = [0, 15];
    }

    initRest(){
        const [A, i, valueDesc] = this.arrayDesc;
        const [N, lengthDesc] = this.arrayLengthDesc;
        const [minLength, maxLength] = this.arrayLengthBound;
        const [minValue, maxValue] = this.arrayValueBound;

        this.#formatLine = `${A}<sub>1</sub> ${A}<sub>2</sub> ... ${A}<sub>${N}</sub>`;
        this.#placeholder = this.defaultValue.join(' ');
        this.#constraints = [
            `${N} = ${lengthDesc}`,
            `${A}<sub>${i}</sub> = ${valueDesc}`,
            `${N} is at least ${minLength} and at most ${maxLength}`,
            `${A}<sub>${i}</sub> is at least ${minValue} and at most ${maxValue}`,
        ];

        this.#inputTextarea = new InputTextarea(this.arrayDesc[0], this.caption, this.#placeholder, 1);
        this.#inputFormat = new InputFormat([this.#formatLine]);
        this.#inputConstraints = new InputConstraints(this.#constraints);
    }

    connectedCallback(){
        const randomButton = document.createElement('button');
        randomButton.classList.add('random');
        randomButton.innerText = 'Random';
        randomButton.addEventListener('click', () => this.generateRandomArray());

        const div = document.createElement('div');
        div.appendChild(this.#inputFormat);

        this.appendChild(this.#inputTextarea);
        this.appendChild(randomButton);
        this.appendChild(div);
        this.appendChild(this.#inputConstraints);
    }

    parseValue(){
        const lines = this.#inputTextarea.getValue()
            .split(/\r\n|\r|\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
        if(lines.length < 1){
            return { type: InputState.Invalid, message: 'There must be one line of integers separated by space' };
        }
        else if(lines.length > 1){
            console.warn('There are more than two lines');
        }

        const _array = lines[0].split(/\s/).filter(array => array.length > 0);
        const [minLength, maxLength] = this.arrayLengthBound;
        if(!(minLength <= _array.length && _array.length <= maxLength)){
            return { type: InputState.Invalid, message: `${this.arrayLengthDesc} = ${_array.length} violates the constraint` };
        }

        const array = [];
        const [minValue, maxValue] = this.arrayValueBound;
        for(let i = 0; i < _array.length; i++){
            const value = parseInt(_array[i]);
            if(Number.isNaN(value)){
                return {
                    type: InputState.Invalid,
                    message: `${this.arrayDesc}<sub>${i + 1}</sub> = '${_array[i]}' cannot be parsed into a valid integer`
                };
            }
            if(!(minValue <= value && value <= maxValue)){
                return {
                    type: InputState.Invalid,
                    message: `${this.arrayDesc}<sub>${i + 1}</sub> = ${value} violates the constraint`
                };
            }
            array.push(value);
        }

        return { type: InputState.Valid, data: array };
    }

    generateRandomArray(){
        const [minLength, maxLength] = this.arrayLengthBound;
        const [minValue, maxValue] = this.arrayValueBound;
        const n = getRandomInt(minLength, maxLength);
        const array = [];
        for(let i = 0; i < n; i++){
            array.push(getRandomInt(minValue, maxValue).toString());
        }
        this.setValue(array);
    }
    
    /**
     * 
     * @param {number[]} value 
     */
    setValue(value){
        this.#inputTextarea.setValue(value.join(' '));
    }

    clearValue(){
        this.#inputTextarea.setValue('');
    }
}

class ArrayInputBuilder {
    /**
     * @type {ArrayInput}
     */
    #arrayInput;

    constructor(){
        this.#reset();
    }

    #reset(){
        this.#arrayInput = new ArrayInput();
    }

    /**
     * 
     * @param {string} caption 
     */
    setCaption(caption){
        this.#arrayInput.caption = caption;
        return this;
    }

    /**
     * 
     * @param {number[]} defaultValue 
     */
    setDefaultValue(defaultValue){
        this.#arrayInput.defaultValue = defaultValue;
        return this;
    }

    /**
     * 
     * @param {string} name 
     * @param {string} index 
     * @param {string} desc 
     */
    setArrayDesc(name, index, desc){
        this.#arrayInput.arrayDesc = [name, index, desc];
        return this;
    }

    /**
     * 
     * @param {string} name 
     * @param {string} desc 
     */
    setArrayLengthDesc(name, desc){
        this.#arrayInput.arrayLengthDesc = [name, desc];
        return this;
    }
    
    /**
     * 
     * @param {number} minLength 
     * @param {number} maxLength 
     */
    setArrayLengthBound(minLength, maxLength){
        this.#arrayInput.arrayLengthBound = [minLength, maxLength];
        return this;
    }

    /**
     * 
     * @param {number} minValue 
     * @param {number} maxValue 
     */
    setArrayValueBound(minValue, maxValue){
        this.#arrayInput.arrayValueBound = [minValue, maxValue];
        return this;
    }

    build(){
        this.#arrayInput.initRest();
        const arrayInput = this.#arrayInput;
        this.#reset();
        return arrayInput;
    }
}

customElements.define('array-input', ArrayInput);

export { ArrayInputBuilder, ArrayInput };