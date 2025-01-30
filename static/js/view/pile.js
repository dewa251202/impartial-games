import { GameState } from "game";
import { Controller } from "controller";

class Piles extends HTMLElement {
    #gameState;
    #games;
    #piles;
    #controller;

    /**
     * 
     * @param {GameState} gameState 
     */
    constructor(gameState){
        super();
        this.#gameState = gameState;
        this.#games = this.#gameState.getGames();
        this.#piles = this.#games.map((game, gameIndex) => new Pile(game.currentItemCount, gameIndex, this));
    }
    
    connectedCallback(){
        this.#piles.forEach(pile => this.appendChild(pile));
        this.startTurn();
    }

    doPcPlayerTurn(nextPosition){
        if(nextPosition === null) return false;
        const [pileIndex, itemIndex] = nextPosition;
        setTimeout(() => {
            this.notify('mouseenter', { pileIndex, itemIndex });
            setTimeout(() => this.notify('click', { pileIndex, itemIndex }), 250);
        }, 500);
        return true;
    }

    /**
     * 
     * @param {string} type 
     * @param {any} data 
     */
    notify(type, data){
        let currentPlayer = this.#gameState.getCurrentPlayer();
        let { pileIndex, itemIndex } = data;
        const pile = this.#piles[pileIndex];
        const removedItemCount = this.#games[pileIndex].currentItemCount - itemIndex;

        if(type === 'mouseenter'){
            if(this.#gameState.isValidMove(pileIndex, removedItemCount)){
                pile.addHints(removedItemCount);

                const moveMessage = `${currentPlayer.getRole()} is going to remove ${removedItemCount} items from ${pile.getName()}`;
                this.#notifyController('beforemove', { moveMessage });
            }
        }
        else if(type === 'click'){
            if(this.#gameState.isValidMove(pileIndex, removedItemCount)){
                this.#gameState.makeMove(pileIndex, removedItemCount);
                pile.removeItems(removedItemCount);

                const moveMessage = `${currentPlayer.getRole()} removed ${removedItemCount} items from ${pile.getName()}`;
                currentPlayer = this.#gameState.getCurrentPlayer();
                this.#notifyController('aftermove', { currentPlayer, moveMessage });

                this.startTurn();
            }
        }
        else if(type === 'mouseleave'){
            pile.removeHints();
            this.#notifyController('cancelmove', { moveMessage: '' });
        }
    }

    #notifyController(type, detail){
        const event = new CustomEvent(type, { detail });
        this.#controller.notify(this, event);
    }

    /**
     * 
     * @param {GameState} gameState 
     */
    setGameState(gameState){
        this.#gameState = gameState;
        this.#games = this.#gameState.getGames();
        this.#piles = this.#games.map((game, gameIndex) => new Pile(game.currentItemCount, gameIndex, this));
        this.connectedCallback();
    }
    
    startTurn(){
        this.#notifyController('gametype', { isWinning: this.#gameState.isWinningGame() });
        if(!this.#gameState.getCurrentPlayer().doTurn(this, this.#gameState)){
            this.#notifyController('gamefinished', { previousPlayer: this.#gameState.getPrevPlayer() });
        }
    }

    /**
     * 
     * @param {boolean} value 
     */
    enableInteractions(value){
        this.#piles.forEach(pile => pile.enableInteractions(value));
    }

    /**
     * 
     * @param {Controller} controller 
     */
    setController(controller){
        this.#controller = controller;
    }

    clear(){
        while(this.hasChildNodes()){
            this.removeChild(this.lastChild);
        }
    }
}

class Pile extends HTMLElement {
    #itemCount;
    #pileIndex;
    #parent;
    #itemContainer;
    #name;
    #interactionsEnabled;
    #lastData;

    constructor(itemCount, pileIndex, parent){
        super();
        this.#itemCount = itemCount ?? 0;
        this.#pileIndex = pileIndex;
        this.#parent = parent;
        this.#itemContainer = document.createElement('div');
        this.#name = `Pile #${pileIndex + 1}`;
        this.#interactionsEnabled = false;

        this.#itemContainer.classList.add('item-container');
        for(let i = 0; i < this.#itemCount; i++){
            const item = document.createElement('div');
            item.innerHTML = 
`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" stroke="black" />
</svg>`;
            item.classList.add('item');
            this.#itemContainer.appendChild(item);
        }

        this.#itemContainer.childNodes.forEach((item, i) => {
            const data = { pileIndex: this.#pileIndex, itemIndex: i };
            this.#addListener('mouseleave', item, data);
            this.#addListener('mouseenter', item.firstChild, data);
            this.#addListener('click', item.firstChild, data);
        });
    }

    connectedCallback(){
        this.appendChild(this.#itemContainer);

        const pileBase = document.createElement('div');
        pileBase.innerText = this.#name;
        pileBase.classList.add('pile-base');
        this.appendChild(pileBase);
    }

    /**
     * 
     * @param {boolean} value 
     */
    enableInteractions(value){
        this.#interactionsEnabled = value;
        if(this.#interactionsEnabled && this.#lastData) this.#parent.notify('mouseenter', this.#lastData);
        else this.#lastData = null;
        this.#itemContainer.childNodes.forEach(item => {
            const cl = item.firstChild.classList;
            if(this.#interactionsEnabled) cl.add('cursor-pointer');
            else cl.remove('cursor-pointer');
        });
    }

    #addListener(type, element, data){
        element.addEventListener(type, () => {
            if(type === 'mouseenter') this.#lastData = { ...data };
            if(!this.#interactionsEnabled) return;
            this.#parent.notify(type, data);
        });
    }

    removeHints(){
        this.#itemContainer.childNodes.forEach(item => item.firstChild.classList.remove('ready-to-select'));
    }

    addHints(removedItemCount){
        const childNodes = this.#itemContainer.childNodes;
        for(let i = 1; i <= removedItemCount; i++){
            childNodes[childNodes.length - i].firstChild.classList.add('ready-to-select');
        }
    }

    removeItems(removedItemCount){
        while(removedItemCount > 0){
            this.#itemContainer.removeChild(this.#itemContainer.lastChild);
            removedItemCount--;
        }
    }

    getName(){
        return this.#name;
    }
}

customElements.define('game-pile', Pile);
customElements.define('game-piles', Piles);

export { Piles };