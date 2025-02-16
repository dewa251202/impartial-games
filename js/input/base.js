import { InputState } from "common";

class BaseInput extends HTMLElement {
    #defaultValue;
    #inputArea;

    setDefaultValue(value){
        this.#defaultValue = value;
        this.setPlaceholder(this.convertValueToPlaceholder(value));
    }

    getDefaultValue(){
        return this.#defaultValue;
    }

    setValue(value){
        this.#inputArea.setValue(value);
    }

    getValue(){
        return this.#inputArea.getValue();
    }

    setPlaceholder(placeholder){
        this.#inputArea.setPlaceholder(placeholder);
    }

    createRandomButton(){
        const randomButton = document.createElement('button');
        randomButton.classList.add('random');
        randomButton.innerText = 'Random';
        randomButton.addEventListener('click', () => this.generateRandomInputValue());
        return randomButton;
    }

    /**
     * @interface
     * @param {any} _value 
     */
    convertValueToPlaceholder(_value){
        throw new Error('Unimplemented');
    }
    
    /**
     * @interface
     */
    generateRandomInputValue(){
        throw new Error('Unimplemented');
    }

    /**
     * @interface
     */
    parseValue(){
        throw new Error('Unimplemented');
    }

    /**
     * 
     * @param {any} data 
     * @returns 
     */
    valid(data){
        return { type: InputState.Valid, data };
    }

    /**
     * 
     * @param {string} message 
     * @returns 
     */
    invalid(message){
        return { type: InputState.Invalid, message };
    }

    /**
     * 
     * @param {string} message 
     */
    warn(message){
        console.warn(message);
    }
}

export { BaseInput };