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
    
    #updateGames(){
        this.#games = this.#gameState.getGames();
        this.#piles = this.#games.map((game, gameIndex) => new Pile(game.getPosition(), gameIndex, this));
    }
    
    #renderPiles(){
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = `${SITE_ROOT}/css/pile.css`;
        this.appendChild(style);

        this.#piles.forEach(pile => this.appendChild(pile));
        this.#interaction.mapGamesToPiles(this.#games, this.#piles);
        if(this.#gameState.getTurnIndex() === 0){
            this.notifyController('scrollbottom');
        }
    }
    
    startTurn(){
        this.#clear();
        this.#updateGames();
        this.#renderPiles();
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

    #clear(){
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
    #visibleSeparatorIndices;
    #touchDetected;

    constructor(itemCount, pileIndex, parent){
        super();
        this.#itemCount = itemCount ?? 0;
        this.#pileIndex = pileIndex;
        this.#parent = parent;
        this.#name = `Pile #${pileIndex + 1}`;

        this.#interactionsEnabled = false;
        this.#selectableItemIndices = [];
        this.#visibleSeparatorIndices = [];
        this.#touchDetected = false;
        
        this.#items = [];
        for(let i = 0; i < this.#itemCount; i++){
            this.#items.push(new Item(this, i));
        }
    }
    
    connectedCallback(){
        const itemContainer = div();
        for(let i = 0; i < this.#items.length; i++){
            if(this.#visibleSeparatorIndices.includes(i)){
                itemContainer.appendChild(new ItemSeparator(this, i));
            }
            itemContainer.appendChild(this.#items[i]);
        }
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
            this.#selectableItemIndices.forEach(i => this.#items[i].addClasses('cursor-pointer'));
        }
        else this.removeClassesFromAllItems('cursor-pointer');
    }

    notify(eventName, type, data){
        if(eventName === 'touchstart') this.#touchDetected = true;
        if(this.#touchDetected && type === 'itemhover') return;

        if(eventName === 'mouseenter') this.#lastData = { ...data };

        if(!this.#interactionsEnabled) return;

        data = { ...data, pile: this, pileIndex: this.#pileIndex };
        this.#parent.notify(type, data);
    }

    removeClassesFromAllItems(...classes){
        this.removeClassesFromItems(0, this.#itemCount, ...classes);
    }

    removeClassesFromItems(startItemIndex, endItemIndex, ...classes){
        for(let i = startItemIndex; i < endItemIndex; i++){
            this.#items[i].removeClasses(...classes);
        }
    }

    addClassesToItems(startItemIndex, endItemIndex, ...classes){
        for(let i = startItemIndex; i < endItemIndex; i++){
            this.#items[i].addClasses(...classes);
        }
    }

    setSelectableItemIndices(itemIndices){
        this.#selectableItemIndices = itemIndices;
    }

    markSelectableItems(){
        this.#selectableItemIndices.forEach(i => this.#items[i].makeSelectable());
    }

    setVisibleSeparatorIndices(visibleSeparatorIndices){
        this.#visibleSeparatorIndices = visibleSeparatorIndices;
    }

    getItemCount(){
        return this.#itemCount;
    }

    getName(){
        return this.#name;
    }
}

class Item extends HTMLElement {
    #pile;
    #index;

    constructor(pile, index){
        super();
        this.#pile = pile;
        this.#index = index;
    }

    connectedCallback(){
        this.innerText = this.#index + 1;
    }

    makeSelectable(){
        const hint = div();
        hint.classList.add('hint', 'cursor-pointer');
        this.appendChild(hint);

        this.#addListener('mouseleave', 'itemunhover');
        this.#addListener('touchstart', 'itemhover');
        this.#addListener('mouseenter', 'itemhover');
        this.#addListener('click', 'itemselect');
    }

    #addListener(eventName, type){
        const data = { itemIndex: this.#index };
        this.addEventListener(eventName, () => this.#pile.notify(eventName, type, data));
    }

    addClasses(...classes){
        this.classList.add(...classes);
    }

    removeClasses(...classes){
        this.classList.remove(...classes);
    }
}

class ItemSeparator extends HTMLElement {
    #pile;
    #index;

    constructor(pile, index){
        super();
        this.#pile = pile;
        this.#index = index;
    }

    connectedCallback(){
        const hitArea = div();
        hitArea.classList.add('hit-area');
        this.appendChild(hitArea);
        
        const sideHitArea = div();
        sideHitArea.classList.add('side-hit-area', 'cursor-pointer');
        sideHitArea.addEventListener('click', () => {
            console.log('cluck');
        });

        const hitAreas = [hitArea, sideHitArea];
        hitAreas.forEach(ha => ha.addEventListener('mouseenter', () => this.expand()));
        hitAreas.forEach(ha => ha.addEventListener('mouseleave', () => this.collapse()));

        this.appendChild(sideHitArea);
    }

    #addListener(eventName, type){
        const data = { separatorIndex: this.#index };
        this.addEventListener(eventName, () => this.#pile.notify(eventName, type, data));
    }

    expand(){
        this.classList.add('expanded', 'cursor-pointer');
        this.#pile.addClassesToItems(0, this.#index, 'split-new');
        this.#pile.addClassesToItems(this.#index, this.#pile.getItemCount(), 'split-old');
    }
    
    collapse(){
        this.classList.remove('expanded', 'cursor-pointer');
        this.#pile.removeClassesFromItems(0, this.#index, 'split-new');
        this.#pile.removeClassesFromItems(this.#index, this.#pile.getItemCount(), 'split-old');
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

    mapGamesToPiles(games = [], piles = []){
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

    mapGamesToPiles(games = [], piles = []){
        
    }
}

customElements.define('pile-item', Item);
customElements.define('item-separator', ItemSeparator);
customElements.define('game-pile', Pile);
customElements.define('game-piles', Piles);

export { Piles, RemoveTop, SplitPile };