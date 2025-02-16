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

class Dialog {
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
    }

    show(){
        this.#element.showModal();
    }

    close(){
        this.#element.close();
    }
}

class Sidebar {
    #controller;
    #element;
    #backdrop;
    #closeButton;
    #isOpened;

    /**
     * 
     * @param {string} selector 
     * @param {Controller} controller 
     */
    constructor(selector, controller){
        this.#controller = controller;
        this.#element = document.querySelector(selector);
        this.#backdrop = document.querySelector('.backdrop');
        this.#closeButton = this.#element.querySelector('button.close');
        this.#closeButton.addEventListener('click', () => this.close());
        this.#isOpened = false;
        this.close();

        document.addEventListener('keyup', event => {
            if(event.key === 'Escape' && this.#isOpened) this.close();
        }, false);
    }

    open(){
        this.#element.style.display = 'block';
        this.#backdrop.style.display = 'block';
        this.#isOpened = true;
    }
    
    close(){
        this.#element.style.display = '';
        this.#backdrop.style.display = '';
        this.#isOpened = false;
    }
}

class GameStatus extends HTMLElement {
    #playerTurn;
    #move;

    constructor(){
        super();
        this.#playerTurn = document.createElement('div');
        this.#move = document.createElement('div');
    }

    connectedCallback(){
        this.appendChild(this.#playerTurn);
        this.appendChild(this.#move);
        this.reset();
    }

    /**
     * 
     * @param {string} playerTurn 
     */
    setPlayerTurn(role){
        this.#playerTurn.innerText = `${role} turn`;
    }

    /**
     * 
     * @param {string} move 
     */
    setMove(move){
        this.#move.innerText = move;
    }

    reset(){
        this.setPlayerTurn('First player');
        this.setMove('');
    }
}

customElements.define('game-status', GameStatus);

export { Button, Dialog, Sidebar, GameStatus }