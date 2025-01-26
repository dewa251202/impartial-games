import { Constants, getRandomInt, InputState } from "../common.js";
import { Controller } from "../controller.js";
import { InputArea, InputConstraints, InputFormat } from "./input.js";

class PileInput {
    #FORMAT_LINES = ['P<sub>1</sub> P<sub>2</sub> ... P<sub>N</sub><br>'];
    #CAPTION = 'Enter the number of items in each pile:';

    #inputArea;
    #inputFormat;
    #inputConstraints;
    #controller;

    /**
     * 
     * @param {string[]} constraints 
     */
    constructor(constraints){
        constraints ??= [];
        
        const placeholder = Constants.DEFAULT_PILES.join(' ');
        this.#inputArea = new InputArea(this.#CAPTION, placeholder, this.#FORMAT_LINES.length);
        this.#inputFormat = new InputFormat(this.#FORMAT_LINES);
        this.#inputConstraints = new InputConstraints(constraints);
    }

    parseValue(){
        const lines = this.#inputArea.getValue()
            .split(/\r\n|\r|\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
        if(lines.length < 1){
            return { type: InputState.Invalid, message: 'There must be one line of integers separated by space' };
        }
        else if(lines.length > 1){
            console.warn('There are more than two lines');
        }

        const _piles = lines[0].split(/\s/).filter(pile => pile.length > 0);
        if(!(0 < _piles.length && _piles.length <= 10)){
            return { type: InputState.Invalid, message: `N = ${_piles.length} violates the constraint` };
        }

        const piles = [];
        for(let i = 0; i < _piles.length; i++){
            const pile = parseInt(_piles[i]);
            if(Number.isNaN(pile)){
                return {
                    type: InputState.Invalid,
                    message: `P<sub>${i + 1}</sub> = '${_piles[i]}' cannot be parsed into a valid integer`
                };
            }
            if(!(0 <= pile && pile <= 15)){
                return { type: InputState.Invalid, message: `P<sub>${i + 1}</sub> = ${pile} violates the constraint` };
            }
            piles.push(pile);
        }

        return { type: InputState.Valid, piles };
    }

    generateRandomPiles(){
        const n = getRandomInt(1, 10);
        const piles = [];
        for(let i = 0; i < n; i++){
            piles.push(getRandomInt(0, 15).toString());
        }
        this.#inputArea.setValue(piles.join(' '));
    }

    /**
     * 
     * @param {Controller} controller 
     */
    setController(controller){
        this.#controller = controller;
    }

    /**
     * 
     * @param {Element} element 
     */
    display(element){
        element.appendChild(this.#inputArea);
        element.appendChild(this.#inputFormat);
        element.appendChild(this.#inputConstraints);
    }
}

class Piles extends HTMLElement {
    #game;
    #piles;

    constructor(piles, game){
        super();
        this.#game = game;

        piles ??= [];
        if(piles.length === 0) console.warn("There are no piles.");
        this.#piles = piles.map((itemCount, pileIndex) => new Pile(itemCount, pileIndex, this));
    }

    connectedCallback(){
        this.#piles.forEach(pile => this.appendChild(pile));
    }

    notify(eventType, data){
        const removedItemIndices = this.#game.tryMove(data);
        if(removedItemIndices === null) return;

        const { pile, pileIndex } = data;
        const { currentPlayer } = this.#game.getState();
        if(eventType === 'mouseenter'){
            pile.addHint(removedItemIndices);
            const text = `${currentPlayer.getRole()} is going to remove ${removedItemIndices.length} items from Pile #${pileIndex + 1}.`;
            document.querySelector('.move').innerText = text;
        }
        else if(eventType === 'click'){
            pile.removeItems(removedItemIndices);
            this.#game.makeMove(data);
            const text = `${currentPlayer.getRole()} removed ${removedItemIndices.length} items from Pile #${pileIndex + 1}.`
            document.querySelector('.move').innerText = text;
        }
        else if(eventType === 'mouseleave'){
            pile.removeHints();
            document.querySelector('.move').innerText = '';
        }
    }
}

class Pile extends HTMLElement {
    #itemCount;
    #pileIndex;
    #board;
    #innerItems;

    constructor(itemCount, pileIndex, board){
        super();
        this.#itemCount = itemCount ?? 0;
        this.#pileIndex = pileIndex;
        this.#board = board;
        this.#innerItems = [];
    }

    connectedCallback(){
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('item-container');
        this.appendChild(itemContainer);

        for(let i = 0; i < this.#itemCount; i++){
            const item = document.createElement('div');
            item.innerHTML = 
`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" stroke="black" />
</svg>`;
            item.classList.add('item');
            itemContainer.appendChild(item);

            this.#innerItems.push(item.firstChild);
        }

        for(let i = 0; i < this.#innerItems.length; i++){
            const data = { pile: this, pileIndex: this.#pileIndex, itemIndex: i };
            itemContainer.childNodes[i].addEventListener('mouseleave', () => this.#board.notify('mouseleave', data));
            this.#innerItems[i].addEventListener('mouseenter', () => this.#board.notify('mouseenter', data));
            this.#innerItems[i].addEventListener('click', () => this.#board.notify('click', data));
        }
        
        const pileBase = document.createElement('div');
        pileBase.innerText = (this.#pileIndex + 1) ? `Pile #${this.#pileIndex + 1}` : 'Pile';
        pileBase.classList.add('pile-base');
        this.appendChild(pileBase);
    }

    removeHints(){
        this.#innerItems.forEach(item => item.classList.remove('ready-to-select'));
    }

    addHint(itemIndices){
        for(const index of itemIndices){
            this.#innerItems[index].classList.add('ready-to-select');
        }
    }

    removeItems(itemIndices){
        for(const index of itemIndices){
            this.#innerItems[index].parentNode.remove();
        }        
    }
}

customElements.define('game-pile', Pile);
customElements.define('game-piles', Piles);

export { PileInput, InputState, Piles };