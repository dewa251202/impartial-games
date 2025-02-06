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

    doPcPlayerTurn(nextGame){
        if(nextGame === null) return false;
        const [pileIndex, [game]] = nextGame;
        // console.log(nextGame);
        const itemIndex = game.getPosition();
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
            item.classList.add('item');
            this.#items.push(item);
        }

        this.#items.forEach((item, i) => {
            const data = { pileIndex: this.#pileIndex, itemIndex: i };
            this.#addListener('mouseleave', item, data);
            this.#addListener('mouseenter', item.firstChild, data);
            this.#addListener('click', item.firstChild, data);
        });
    }
    
    connectedCallback(){
        const itemContainer = div();
        itemContainer.classList.add('item-container');
        for(let i = 0; i < this.#items.length; i++){
            if(i > 0){
                const hitDiv = div();
                hitDiv.style.paddingBlock = '0.1em';
                hitDiv.style.width = '40%';
                hitDiv.addEventListener('mouseenter', () => {
                    console.log('henlo');
                });
                itemContainer.append(hitDiv);
            }
            itemContainer.appendChild(this.#items[i]);
        }
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
        if(this.#interactionsEnabled && this.#lastData) this.#parent.notify('mouseenter', this.#lastData);
        else this.#lastData = null;
        if(this.#interactionsEnabled) this.addClasses(0, this.#itemCount, 'cursor-pointer');
        else this.removeAllItemClasses('cursor-pointer');
    }

    #addListener(type, element, data){
        element.addEventListener(type, () => {
            if(type === 'mouseenter') this.#lastData = { ...data };
            if(!this.#interactionsEnabled) return;
            this.#parent.notify(type, data);
        });
    }

    removeAllItemClasses(...classes){
        this.removeClasses(0, this.#itemCount, ...classes);
    }

    removeClasses(startItemIndex, endItemIndex, ...classes){
        for(let i = startItemIndex; i < endItemIndex; i++){
            this.#items[i].firstChild.classList.remove(...classes);
        }
    }

    addClasses(startItemIndex, endItemIndex, ...classes){
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

    /**
     * 
     * @param {Piles} board 
     */
    setBoard(board){
        this.#board = board;
    }

    notify(type, data){
        const gameState = this.#board.getGameState();
        const { game, pile, pileIndex, itemIndex } = data;
        const itemCount = game.getPosition();
        const removedItemCount = itemCount - itemIndex;
        let currentPlayer = gameState.getCurrentPlayer();

        if(type === 'mouseenter'){
            if(gameState.isValidMove(pileIndex, removedItemCount)){
                pile.addClasses(itemCount - removedItemCount, itemCount, 'ready-to-select');

                const moveMessage = `${currentPlayer.getRole()} is going to remove ${removedItemCount} items from ${pile.getName()}`;
                this.#board.notifyController('beforemove', { moveMessage });
            }
        }
        else if(type === 'click'){
            if(gameState.isValidMove(pileIndex, removedItemCount)){
                gameState.makeMove(pileIndex, removedItemCount);
                
                const moveMessage = `${currentPlayer.getRole()} removed ${removedItemCount} items from ${pile.getName()}`;
                currentPlayer = gameState.getCurrentPlayer();
                this.#board.notifyController('aftermove', { currentPlayer, moveMessage });
                this.#board.startTurn();
            }
        }
        else if(type === 'mouseleave'){
            pile.removeAllItemClasses('ready-to-select');
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