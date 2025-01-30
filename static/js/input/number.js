import { getRandomInt, InputState } from "common";
import { InputConstraints, InputNumber } from "./components.js";

class NumberInput extends HTMLElement {
    caption;
    defaultValue;
    valueDesc;
    valueBound;

    #inputNumber;

    constructor(){
        super();
        this.caption = 'Enter an integer:';
        this.defaultValue = 6;
    }

    initRest(){
        this.#inputNumber = new InputNumber(this.valueDesc[0], this.caption, this.defaultValue);
    }

    connectedCallback(){
        const randomButton = document.createElement('button');
        randomButton.classList.add('random');
        randomButton.innerText = 'Random';
        randomButton.addEventListener('click', () => this.generateRandomNumber());

        const [minValue, maxValue] = this.valueBound;
        const inputConstraints = new InputConstraints([`${this.valueDesc[1]} is at least ${minValue} and at most ${maxValue}`]);
        
        this.appendChild(this.#inputNumber);
        this.appendChild(randomButton);
        this.appendChild(inputConstraints);
    }
    
    parseValue(){
        if(Number.isNaN(this.#inputNumber.getValue())) this.#inputNumber.setValue(this.defaultValue);
        const [minValue, maxValue] = this.valueBound;
        const value = this.#inputNumber.getValue();
        if(!(minValue <= value && value <= maxValue)){
            return {
                type: InputState.Invalid,
                message: 'Entered number violates the constraint'
            }
        }

        return {
            type: InputState.Valid,
            data: value
        };
    }
    
    generateRandomNumber(){
        const [minValue, maxValue] = this.valueBound;
        this.#inputNumber.setValue(getRandomInt(minValue, maxValue));
    }
}
class NumberInputBuilder {
    /**
     * @type {NumberInput}
     */
    #numberInput;

    constructor(){
        this.#reset();
    }

    #reset(){
        this.#numberInput = new NumberInput();
    }

    /**
     * 
     * @param {string} caption 
     */
    setCaption(caption){
        this.#numberInput.caption = caption;
        return this;
    }

    /**
     * 
     * @param {number} defaultValue 
     */
    setDefaultValue(defaultValue){
        this.#numberInput.defaultValue = defaultValue;
        return this;
    }

    /**
     * 
     * @param {string} name 
     * @param {string} desc 
     */
    setValueDesc(name, desc){
        this.#numberInput.valueDesc = [name, desc];
        return this;
    }
    
    /**
     * 
     * @param {number} minValue 
     * @param {number} maxValue 
     */
    setValueBound(minValue, maxValue){
        this.#numberInput.valueBound = [minValue, maxValue];
        return this;
    }

    build(){
        this.#numberInput.initRest();
        const arrayInput = this.#numberInput;
        this.#reset();
        return arrayInput;
    }
}

customElements.define('number-input', NumberInput);

export { NumberInputBuilder };