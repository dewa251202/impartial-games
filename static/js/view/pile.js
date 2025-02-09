import { div } from "common";
import { Controller } from "controller";

class Piles extends HTMLElement {
    #gameState;
    #games;
    #piles;
    #controller;
    #interaction;

    constructor(interaction){
        super();
        this.#interaction = interaction;
        interaction.setBoard(this);
    }
    
    connectedCallback(){
        this.startTurn();
    }

    doPcPlayerTurn(nextGames){
        if(nextGames === null) return false;
        return this.#interaction.doPcPlayerTurn(nextGames);
    }

    /**
     * 
     * @param {string} type 
     * @param {any} data 
    */
    notify(type, data){
        const { pileIndex } = data;
        data.game = this.#games[pileIndex];
        data.pile = this.#piles[pileIndex];
        this.#interaction.notify(type, data);
    }

    notifyController(type, detail){
        const event = new CustomEvent(type, { detail });
        this.#controller.notify(this, event);
    }
    
    updateGames(){
        this.#games = this.#gameState.getGames();
        this.#piles = this.#games.map((game, gameIndex) => new Pile(game.getPosition(), gameIndex, this));
    }
    
    renderPiles(){
        this.#piles.forEach(pile => this.appendChild(pile));
        if(this.#gameState.getTurnIndex() === 0){
            this.notifyController('scrollbottom');
        }
    }
    
    startTurn(){
        this.clear();
        this.updateGames();
        this.renderPiles();
        this.notifyController('gametype', { isWinning: this.#gameState.isWinningGame() });
        if(!this.#gameState.getCurrentPlayer().doTurn(this, this.#gameState)){
            this.enableInteractions(false);
            this.notifyController('gamefinished', { previousPlayer: this.#gameState.getPrevPlayer() });
        }
    }

    /**
     * 
     * @param {boolean} value 
     */
    enableInteractions(value){
        this.#piles.forEach(pile => pile.enableInteractions(value));
    }

    setGameState(gameState){
        this.#gameState = gameState;
    }

    getGameState(){
        return this.#gameState;
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
    #items;
    #name;
    #interactionsEnabled;
    #lastData;

    constructor(itemCount, pileIndex, parent){
        super();
        this.#itemCount = itemCount ?? 0;
        this.#pileIndex = pileIndex;
        this.#parent = parent;
        this.#name = `Pile #${pileIndex + 1}`;
        this.#interactionsEnabled = false;
        
        this.#items = [];
        for(let i = 0; i < this.#itemCount; i++){
            const item = document.createElement('div');
            item.innerHTML = 
            // <circle id="circle" cx="50%" cy="50%" r="49" stroke="black"/>
            `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="100%" height="100%" stroke="black"/>
            </svg>`;
            const itemNumber = document.createElement('div');
            itemNumber.classList.add('item-number');
            itemNumber.innerText = i + 1;
            item.appendChild(itemNumber);
            item.classList.add('item');
            this.#items.push(item);
        }

        this.#items.forEach((item, i) => {
            const data = { pileIndex: this.#pileIndex, itemIndex: i };
            this.#addListener('mouseleave', 'itemunhover', item, data);
            this.#addListener('mouseenter', 'itemhover', item.firstChild, data);
            this.#addListener('click', 'itemselect', item.firstChild, data);
        });
    }
    
    connectedCallback(){
        const itemContainer = div(...this.#items);
        itemContainer.classList.add('item-container');
        this.appendChild(itemContainer);

        const pileBase = document.createElement('div');
        pileBase.innerText = `${this.#name}\nItems: ${this.#itemCount}`;
        pileBase.classList.add('pile-base');
        this.appendChild(pileBase);
    }

    /**
     * 
     * @param {boolean} value 
     */
    enableInteractions(value){
        this.#interactionsEnabled = value;
        if(this.#interactionsEnabled && this.#lastData) this.#parent.notify('itemhover', this.#lastData);
        else this.#lastData = null;
        if(this.#interactionsEnabled) this.addClassesToItems(0, this.#itemCount, 'cursor-pointer');
        else this.removeClassesFromAllItems('cursor-pointer');
    }

    #addListener(eventName, type, element, data){
        element.addEventListener(eventName, () => {
            if(eventName === 'mouseenter') this.#lastData = { ...data };
            if(!this.#interactionsEnabled) return;
            this.#parent.notify(type, data);
        });
    }

    removeClassesFromAllItems(...classes){
        this.removeClassesFromItems(0, this.#itemCount, ...classes);
    }

    removeClassesFromItems(startItemIndex, endItemIndex, ...classes){
        for(let i = startItemIndex; i < endItemIndex; i++){
            this.#items[i].firstChild.classList.remove(...classes);
        }
    }

    addClassesToItems(startItemIndex, endItemIndex, ...classes){
        for(let i = startItemIndex; i < endItemIndex; i++){
            this.#items[i].firstChild.classList.add(...classes);
        }
    }

    getName(){
        return this.#name;
    }
}

class RemoveTop {
    #board;
    #lastHoverItem;

    /**
     * 
     * @param {Piles} board 
     */
    setBoard(board){
        this.#board = board;
        this.#lastHoverItem = null;
    }

    doPcPlayerTurn(nextGames){
        const [pileIndex, [game]] = nextGames;
        // console.log(nextGame);
        const itemIndex = game.getPosition();
        setTimeout(() => {
            this.#board.notify('itemhover', { pileIndex, itemIndex });
            setTimeout(() => this.#board.notify('itemselect', { pileIndex, itemIndex }), 250);
        }, 500);
        return true;
    }

    notify(type, data){
        const gameState = this.#board.getGameState();
        const { pile, pileIndex, itemIndex } = data;
        const removedItemCount = itemIndex + 1;
        let currentPlayer = gameState.getCurrentPlayer();

        const markHoveredItems = () => {
            pile.addClassesToItems(0, removedItemCount, 'ready-to-select');
            this.#lastHoverItem = [pile, itemIndex];
        }

        if(type === 'itemhover'){
            if(gameState.isValidMove(pileIndex, removedItemCount)){
                markHoveredItems();
                
                const moveMessage = `${currentPlayer.getRole()} is going to remove ${removedItemCount} items from ${pile.getName()}`;
                this.#board.notifyController('beforemove', { moveMessage });
            }
        }
        else if(type === 'itemselect'){
            if(this.#lastHoverItem === null){
                markHoveredItems();
                return;
            }
            if(!(this.#lastHoverItem[0] === pile && this.#lastHoverItem[1] === itemIndex)){
                this.#lastHoverItem[0].removeClassesFromAllItems('ready-to-select');
                markHoveredItems();
                return;
            }
            if(gameState.isValidMove(pileIndex, removedItemCount)){
                gameState.makeMove(pileIndex, removedItemCount);
                
                const moveMessage = `${currentPlayer.getRole()} removed ${removedItemCount} items from ${pile.getName()}`;
                currentPlayer = gameState.getCurrentPlayer();
                this.#board.notifyController('aftermove', { currentPlayer, moveMessage });
                this.#board.startTurn();
            }
        }
        else if(type === 'itemunhover'){
            pile.removeClassesFromAllItems('ready-to-select');
            this.#board.notifyController('cancelmove', { moveMessage: '' });
        }
    }
}

class SplitPile {
    #board;

    /**
     * 
     * @param {Piles} board 
     */
    setBoard(board){
        this.#board = board;
    }

    notify(type, data){
        if(type === 'separator'){
            console.log('aye');
            return;
        }
    }
}

customElements.define('game-pile', Pile);
customElements.define('game-piles', Piles);

export { Piles, RemoveTop, SplitPile };