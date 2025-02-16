import { div } from "common";

class Cells extends HTMLElement {
    #controller;
    #gameState;
    #cells;
    #games;
    #lastClickedGame;

    constructor(){
        super();
        this.#lastClickedGame = null;
    }

    connectedCallback(){
        this.startTurn();
    }

    setController(controller){
        this.#controller = controller;
    }

    setGameState(gameState){
        this.#gameState = gameState;
    }

    #notifyController(type, detail){
        const event = new CustomEvent(type, { detail });
        this.#controller.notify(this, event);
    }

    #updateGames(){
        const gameIndices = this.#gameState.getGameIndices();
        this.#cells = gameIndices.map((internalGameIndices, cellIndex) => new Cell(cellIndex, internalGameIndices, this));
        this.#games = this.#gameState.getGames();
    }
    
    #renderCells(){
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = './cell.css';
        this.appendChild(style);

        this.#cells.forEach(pile => this.appendChild(pile));
    }
    
    startTurn(){
        this.#lastClickedGame = null;
        this.#clear();
        this.#updateGames();
        this.#renderCells();
        this.#notifyController('gametype', { isWinning: this.#gameState.isWinningGame() });
        if(!this.#gameState.getCurrentPlayer().doTurn(this, this.#gameState)){
            this.enableInteractions(false);
            this.#notifyController('gamefinished', { previousPlayer: this.#gameState.getPrevPlayer() });
        }
    }

    doPcPlayerTurn(nextGames){
        if(nextGames === null) return false;
        const [gameIndex, [game]] = nextGames;
        const cellIndex = this.#games[gameIndex].getPosition();
        const itemClickData = { eventSource: 'item', cellIndex, gameIndex };
        setTimeout(() => {
            this.notify('itemclick', itemClickData);

            const cellIndex = game.getPosition();
            const cell = this.#cells[cellIndex];
            const cellClickData = { eventSource: 'cell', cellIndex, gameIndex, cell };
            setTimeout(() => this.notify('cellclick', cellClickData), 250);
        }, 500);
        return true;
    }

    notify(type, data){
        const currentPlayer = this.#gameState.getCurrentPlayer();
        const { eventSource, event, cellIndex } = data;
        if(eventSource === 'item'){
            const { gameIndex } = data;
            const nextCellBound = this.#gameState.getNextCellBound(cellIndex);
            if(nextCellBound === null) return;
            const [ai, bi] = nextCellBound;
            
            if(type === 'itemhover'){
                this.#addClassesToCells(ai, bi, 'hinting');

                const sourceCell = this.#cells[cellIndex];
                this.#notifyController('beforemove', {
                    moveMessage: `${currentPlayer.getRole()} is going to move an item from ${sourceCell.getName()}`
                });
            }
            else if(type === 'itemunhover'){
                this.#removeClassesFromCells(0, this.#cells.length - 1, 'hinting');

                this.#notifyController('cancelmove', { moveMessage: '' });
            }
            else if(type === 'itemdrag'){
                if(this.#lastClickedGame !== null){
                    const [cellIndex, gameIndex] = this.#lastClickedGame;
                    this.#doItemUndrag(cellIndex, gameIndex);
                }

                this.#doItemDrag(cellIndex, gameIndex);
                event.dataTransfer.setData('game-index', gameIndex);

                const sourceCell = this.#cells[cellIndex];
                this.#notifyController('beforemove', {
                    moveMessage: `${currentPlayer.getRole()} is going to move an item from ${sourceCell.getName()}`
                });
            }
            else if(type === 'itemundrag'){
                const gameIndex = parseInt(event.dataTransfer.getData('game-index'));
                const sourceCell = this.querySelector(`[game-index="${gameIndex}"]`).getSourceCell();
                this.#doItemUndrag(sourceCell.getCellIndex(), gameIndex);

                this.#notifyController('cancellmove', { moveMessage: '' });
            }
            else if(type === 'itemclick'){
                const cellAndGameIndex = [cellIndex, gameIndex];
                if(this.#lastClickedGameEquals(cellAndGameIndex)){
                    this.#doItemUndrag(cellIndex, gameIndex);
                    this.#lastClickedGame = null;

                    this.#notifyController('cancelmove', { moveMessage: '' });
                }
                else{
                    if(this.#lastClickedGame !== null){
                        const [cellIndex, gameIndex] = this.#lastClickedGame;
                        this.#doItemUndrag(cellIndex, gameIndex);
                    }
                    this.#doItemDrag(cellIndex, gameIndex);
                    this.#lastClickedGame = cellAndGameIndex;

                    const sourceCell = this.#cells[cellIndex];
                    this.#notifyController('beforemove', {
                        moveMessage: `${currentPlayer.getRole()} is going to move an item from ${sourceCell.getName()}`
                    });
                }
            }
        }
        else{
            const { cell } = data;
            if(!cell.isDroppable()) return;

            if(type === 'itemovercell'){
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                cell.classList.add('about-to-drop');

                const gameIndex = event.dataTransfer.getData('game-index');
                const sourceCell = this.querySelector(`[game-index="${gameIndex}"]`).getSourceCell();
                this.#notifyController('beforemove', {
                    moveMessage: `${currentPlayer.getRole()} is going to move an item from ${sourceCell.getName()} to ${cell.getName()}`
                });
            }
            else if(type === 'itemleavecell'){
                cell.classList.remove('about-to-drop');

                const gameIndex = event.dataTransfer.getData('game-index');
                const sourceCell = this.querySelector(`[game-index="${gameIndex}"]`).getSourceCell();
                this.#notifyController('beforemove', {
                    moveMessage: `${currentPlayer.getRole()} is going to move an item from ${sourceCell.getName()}`
                });
            }
            else if(type === 'itemdropcell'){
                cell.classList.remove('about-to-drop');
                const gameIndex = parseInt(event.dataTransfer.getData('game-index'));
                
                const sourceCell = this.querySelector(`[game-index="${gameIndex}"]`).getSourceCell();
                this.#makeMove(gameIndex, cellIndex, sourceCell);
            }
            else if(type === 'cellclick'){
                if(this.#lastClickedGame === null) return;
                cell.classList.add('about-to-drop');
                const [sourceCellIndex, itemGameIndex] = this.#lastClickedGame;
                
                const sourceCell = this.#cells[sourceCellIndex];
                this.#makeMove(itemGameIndex, cellIndex, sourceCell);
            }
            else if(type === 'cellhover' && this.#lastClickedGame !== null){
                const [cellIndex, _] = this.#lastClickedGame;
                const sourceCell = this.#cells[cellIndex];
                this.#notifyController('beforemove', {
                    moveMessage: `${currentPlayer.getRole()} is going to move an item from ${sourceCell.getName()} to ${cell.getName()}`
                });
            }
        }
    }
    
    #makeMove(gameIndex, targetCellIndex, sourceCell){
        const targetCell = this.#cells[targetCellIndex];
        
        this.#gameState.makeMove(gameIndex, targetCellIndex);
        
        const lastPlayer = this.#gameState.getLastPlayer();
        const moveMessage = `${lastPlayer.getRole()} moved an item from ${sourceCell.getName()} to ${targetCell.getName()}`;
        const currentPlayer = this.#gameState.getCurrentPlayer();
        this.notifyController('aftermove', { currentPlayer, moveMessage });
        this.startTurn();
    }

    notifyController(type, detail){
        const event = new CustomEvent(type, { detail });
        this.#controller.notify(this, event);
    }

    #addClassesToCells(l, r, ...classes){
        for(let i = l; i <= r; i++){
            this.#cells[i].classList.add(...classes);
        }
    }

    #removeClassesFromCells(l, r, ...classes){
        for(let i = l; i <= r; i++){
            this.#cells[i].classList.remove(...classes);
        }
    }

    #doItemDrag(cellIndex, gameIndex){
        const nextCellBound = this.#gameState.getNextCellBound(cellIndex);
        if(nextCellBound === null) return;
        const [ai, bi] = nextCellBound;
        this.#cells[cellIndex].addClassesToItem(gameIndex, 'dragging');
        this.#addClassesToCells(ai, bi, 'droppable');
        for(let i = ai; i <= bi; i++){
            this.#cells[i].setDroppable(true);
        }
    }

    #doItemUndrag(cellIndex, gameIndex){
        const nextCellBound = this.#gameState.getNextCellBound(cellIndex);
        if(nextCellBound === null) return;
        const [ai, bi] = nextCellBound;
        this.#cells[cellIndex].removeClassesFromItem(gameIndex, 'dragging');
        this.#removeClassesFromCells(ai, bi, 'droppable');
        for(let i = ai; i <= bi; i++){
            this.#cells[i].setDroppable(false);
        }
    }

    /**
     * 
     * @param {boolean} value 
     */
    enableInteractions(value){
        this.#cells.forEach(cell => cell.enableInteractions(value));
    }

    #clear(){
        while(this.childNodes.length > 0){
            this.removeChild(this.lastChild);
        }
    }

    #lastClickedGameEquals(cellAndGameIndex){
        if(this.#lastClickedGame === null || cellAndGameIndex === null){
            return this.#lastClickedGame === cellAndGameIndex;
        }
        const [cellIndex, gameIndex] = cellAndGameIndex;
        return this.#lastClickedGame[0] === cellIndex && this.#lastClickedGame[1] === gameIndex;
    }
}

class Cell extends HTMLElement {
    #interactionsEnabled;
    #cellIndex;
    #name;
    #items;
    #parent;
    #droppable;

    constructor(cellIndex, gameIndices, parent){
        super();
        this.#cellIndex = cellIndex;
        this.#name = `Cell #${cellIndex + 1}`;
        this.#parent = parent;
        this.#interactionsEnabled = false;
        this.#droppable = false;

        this.#items = new Map();
        const cellData = { eventSource: 'cell', cell: this, cellIndex: this.#cellIndex };
        for(const gameIndex of gameIndices){
            const item = new Item(this, gameIndex);
            this.#items.set(gameIndex, item);

            const itemData = { ...cellData, eventSource: 'item', gameIndex };
            this.#addListener('mouseenter', 'itemhover', item, itemData);
            this.#addListener('mouseleave', 'itemunhover', item, itemData);
            this.#addListener('dragstart', 'itemdrag', item, itemData);
            this.#addListener('dragend', 'itemundrag', item, itemData);
            this.#addListener('click', 'itemclick', item, itemData);
        }

        this.#addListener('dragenter', 'itementercell', this, cellData);
        this.#addListener('dragover', 'itemovercell', this, cellData);
        this.#addListener('dragleave', 'itemleavecell', this, cellData);
        this.#addListener('drop', 'itemdropcell', this, cellData);
        this.#addListener('click', 'cellclick', this, cellData);
        this.#addListener('mouseover', 'cellhover', this, cellData);
    }

    connectedCallback(){
        const cellName = document.createElement('span');
        cellName.innerText = this.#name;

        const cellInfo = div(cellName);
        cellInfo.classList.add('cell-info');
        this.appendChild(cellInfo);

        const hint = document.createElement('div');
        hint.classList.add('hint');
        this.appendChild(hint);
        
        if(this.#items.size <= 0) return;
        
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('item-container');
        const itemsIter = this.#items.values();
        const itemInCell = itemsIter.next().value;
        for(const item of itemsIter){
            itemContainer.appendChild(item);
        }

        const cellItemWrapper = div(itemInCell);
        cellItemWrapper.classList.add('cell-item-wrapper');

        const wrapper = div(cellItemWrapper, itemContainer);
        wrapper.classList.add('item-wrapper');
        // this.appendChild(itemInCell);
        // this.appendChild(itemContainer);
        this.appendChild(wrapper);
    }

    enableInteractions(value){
        this.#interactionsEnabled = value;
        for(const item of this.#items.values()){
            if(this.#interactionsEnabled){
                item.classList.remove('disabled');
                item.draggable = true;
            }
            else{
                item.classList.add('disabled');
                item.draggable = false;
            }
        }
    }

    #addListener(eventName, type, element, data){
        element.addEventListener(eventName, ev => {
            if(!this.#interactionsEnabled) return;
            data.event = ev;
            this.#parent.notify(type, data);
        });
    }

    addClassesToItem(gameIndex, ...classes){
        this.#items.get(gameIndex).classList.add(...classes);
    }

    removeClassesFromItem(gameIndex, ...classes){
        this.#items.get(gameIndex).classList.remove(...classes);
    }

    setDroppable(value){
        this.#droppable = value;
    }

    isDroppable(){
        return this.#droppable;
    }

    getName(){
        return this.#name;
    }

    getCellIndex(){
        return this.#cellIndex;
    }
}

class Item extends HTMLElement {
    #gameIndex;
    #cell;

    constructor(cell, gameIndex){
        super();
        this.#cell = cell;
        this.#gameIndex = gameIndex;
    }

    connectedCallback(){
        this.classList.add('item', 'cursor-pointer');
        this.draggable = true;
        this.setAttribute('game-index', this.#gameIndex);
    }

    getSourceCell(){
        return this.#cell;
    }

    getGameIndex(){
        return this.#gameIndex;
    }
}

customElements.define('game-cells', Cells);
customElements.define('game-cell', Cell);
customElements.define('game-item', Item);

export { Cells };