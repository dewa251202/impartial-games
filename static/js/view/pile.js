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
        this.#interaction.markSelectableItems(this.#games, this.#piles);
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

    getPile(pileIndex){
        return this.#piles[pileIndex];
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
    #selectableItemIndices;

    constructor(itemCount, pileIndex, parent){
        super();
        this.#itemCount = itemCount ?? 0;
        this.#pileIndex = pileIndex;
        this.#parent = parent;
        this.#name = `Pile #${pileIndex + 1}`;
        this.#interactionsEnabled = false;
        this.#selectableItemIndices = [];
        
        this.#items = [];
        for(let i = 0; i < this.#itemCount; i++){
            const item = document.createElement('div');
            item.innerText = i + 1;
            item.classList.add('item');
            this.#items.push(item);
        }
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

        if(this.#interactionsEnabled){
            this.#selectableItemIndices.forEach(i => this.#items[i].classList.add('cursor-pointer'));
        }
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
            this.#items[i].classList.remove(...classes);
        }
    }

    addClassesToItems(startItemIndex, endItemIndex, ...classes){
        for(let i = startItemIndex; i < endItemIndex; i++){
            this.#items[i].classList.add(...classes);
        }
    }

    setSelectableItemIndices(itemIndices){
        this.#selectableItemIndices = itemIndices;
    }

    markSelectableItems(){
        for(const itemIndex of this.#selectableItemIndices){
            const item = this.#items[itemIndex];
            const hint = document.createElement('div');
            hint.classList.add('hint', 'cursor-pointer');

            item.appendChild(hint);

            const data = { pile: this, pileIndex: this.#pileIndex, itemIndex };
            this.#addListener('mouseleave', 'itemunhover', item, data);
            this.#addListener('mouseenter', 'itemhover', item, data);
            this.#addListener('click', 'itemselect', item, data);
        }
    }

    getItemCount(){
        return this.#itemCount;
    }

    getName(){
        return this.#name;
    }
}

class RemoveTop {
    #board;
    #lastHoveredItem;

    /**
     * 
     * @param {Piles} board 
     */
    setBoard(board){
        this.#board = board;
        this.#lastHoveredItem = null;
    }

    doPcPlayerTurn(nextGames){
        const [pileIndex, [game]] = nextGames;
        const pile = this.#board.getPile(pileIndex);
        const itemIndex = pile.getItemCount() - game.getPosition() - 1;
        const data = { pile, pileIndex, itemIndex };
        setTimeout(() => {
            this.#board.notify('itemhover', data);
            setTimeout(() => this.#board.notify('itemselect', data), 250);
        }, 500);
        return true;
    }

    notify(type, data){
        const gameState = this.#board.getGameState();
        const { pile, pileIndex, itemIndex } = data;
        const removedItemCount = itemIndex + 1;
        let currentPlayer = gameState.getCurrentPlayer();
        
        if(type === 'itemhover'){
            if(gameState.isValidMove(pileIndex, removedItemCount)){
                pile.addClassesToItems(0, removedItemCount, 'ready-to-select');
                this.#lastHoveredItem = [pile, itemIndex];
                
                const moveMessage = `${currentPlayer.getRole()} is going to remove ${removedItemCount} items from ${pile.getName()}`;
                this.#board.notifyController('beforemove', { moveMessage });
            }
        }
        else if(type === 'itemselect'){
            if(gameState.isValidMove(pileIndex, removedItemCount)){
                if(this.#lastHoveredItem === null){
                    this.notify('itemhover', data);
                    return;
                }
                else if(!(this.#lastHoveredItem[0] === pile && this.#lastHoveredItem[1] === itemIndex)){
                    this.#lastHoveredItem[0].removeClassesFromAllItems('ready-to-select');
                    this.notify('itemhover', data);
                    return;
                }

                gameState.makeMove(pileIndex, removedItemCount);
                this.#lastHoveredItem = null;
                
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

    markSelectableItems(games = [], piles = []){
        for(let i = 0; i < games.length; i++){
            const itemIndices = games[i].getNextPossibleGames().map(([g]) => piles[i].getItemCount() - g.getPosition() - 1);
            piles[i].setSelectableItemIndices(itemIndices);
            piles[i].markSelectableItems();
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

    markSelectableItems(){

    }
}

customElements.define('game-pile', Pile);
customElements.define('game-piles', Piles);

export { Piles, RemoveTop, SplitPile };