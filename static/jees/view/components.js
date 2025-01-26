import { Controller } from "controller";

class Button {
    #controller;
    #element;

    /**
     * 
     * @param {string} selector 
     * @param {Controller} controller 
     */
    constructor(selector, controller){
        this.#controller = controller;
        this.#element = document.querySelector(selector);
        this.#element.addEventListener('click', event => this.#controller.notify(this, event));
    }
}

export { Button }