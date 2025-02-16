import { BaseGameState } from "base-game";
import { div, toKebabCase } from "common";

class Player {
    #role;

    /**
     * 
     * @param {string} role 
     */
    constructor(role){
        this.#role = role;
    }

    getRole(){
        return this.#role;
    }
}

class HumanPlayer extends Player {
    /**
     * 
     * @param {import("common").Board} board 
     * @param {BaseGameState} gameState 
    */
    doTurn(board, gameState){
       board.enableInteractions(true);
       return gameState.canMove();
    }
}

class PcPlayer extends Player {
    #playOptimally;
    
    /**
     * 
     * @param {string} role 
     * @param {boolean} playOptimally 
    */
    constructor(role, playOptimally){
       super(role);
       this.#playOptimally = playOptimally;
    }
    
    /**
     * 
     * @param {import("common").Board} board 
     * @param {BaseGameState} gameState 
     */
    doTurn(board, gameState){
        board.enableInteractions(false);
        const nextPosition = this.#playOptimally ? gameState.getRandomOptimalNextGame() : gameState.getRandomNextGame();
        return board.doPcPlayerTurn(nextPosition);
    }
}

class PlayerConfig extends HTMLElement {
    #role;
    #pcRadio;
    #pcPlayRandomlyRadio;
    #pcPlayOptimallyRadio;

    constructor(){
        super();
    }

    connectedCallback(){
        this.#role = this.getAttribute('player-role');
        const pcChecked = this.getAttribute('type') === 'pc';
        const pcPlayOptimallyChecked = this.getAttribute('pc-behavior') === 'optimal';
    
        const kebabRole = toKebabCase(this.#role);
        if(!this.id) this.id = `${kebabRole}-config`;
        
        this.#pcRadio = document.createElement('input');
        this.#pcRadio.type = 'radio';
        this.#pcRadio.id = `${kebabRole}-pc`;
        this.#pcRadio.name = kebabRole;
        this.#pcRadio.value = 'pc';
        if(pcChecked) this.#pcRadio.checked = true;

        const humanRadio = document.createElement('input');
        humanRadio.type = 'radio';
        humanRadio.id = `${kebabRole}-human`;
        humanRadio.name = kebabRole;
        humanRadio.value = 'human';
        if(!pcChecked) humanRadio.checked = true;

        this.#pcPlayRandomlyRadio = document.createElement('input');
        this.#pcPlayRandomlyRadio.type = 'radio';
        this.#pcPlayRandomlyRadio.id = `${kebabRole}-pc-random`;
        this.#pcPlayRandomlyRadio.name = `${kebabRole}-pc-behavior`;
        this.#pcPlayRandomlyRadio.value = 'random';
        if(!pcPlayOptimallyChecked) this.#pcPlayRandomlyRadio.checked = true;

        this.#pcPlayOptimallyRadio = document.createElement('input');
        this.#pcPlayOptimallyRadio.type = 'radio';
        this.#pcPlayOptimallyRadio.id = `${kebabRole}-pc-optimal`;
        this.#pcPlayOptimallyRadio.name = `${kebabRole}-pc-behavior`;
        this.#pcPlayOptimallyRadio.value = 'optimal';
        if(pcPlayOptimallyChecked) this.#pcPlayOptimallyRadio.checked = true;

        const roleSpan = document.createElement('span');
        roleSpan.innerText = `${this.#role} is`;
        this.appendChild(roleSpan);
        
        const humanLabel = document.createElement('label');
        humanLabel.htmlFor = humanRadio.id;
        humanLabel.innerText = ' Human';
        this.appendChild(div(humanRadio, humanLabel));
        
        const pcLabel = document.createElement('label');
        pcLabel.htmlFor = this.#pcRadio.id;
        pcLabel.innerText = ' PC';
        this.appendChild(div(this.#pcRadio, pcLabel));

        humanRadio.addEventListener('input', () => pcBehaviorDiv.style.display = 'none');
        this.#pcRadio.addEventListener('input', () => pcBehaviorDiv.style.display = 'block');

        const pcBehaviorSpan = document.createElement('span');
        pcBehaviorSpan.innerText = `PC playing behavior:`;
        
        const pcPlayRandomlyLabel = document.createElement('label');
        pcPlayRandomlyLabel.htmlFor = this.#pcPlayRandomlyRadio.id;
        pcPlayRandomlyLabel.innerText = ' Play randomly';
        
        const pcPlayOptimallyLabel = document.createElement('label');
        pcPlayOptimallyLabel.htmlFor = this.#pcPlayOptimallyRadio.id;
        pcPlayOptimallyLabel.innerText = ' Play optimally';
        
        const pcBehaviorDiv = document.createElement('div');
        if(!this.#pcRadio.checked) pcBehaviorDiv.style.display = 'none';
        pcBehaviorDiv.appendChild(div(
            pcBehaviorSpan,
            div(this.#pcPlayRandomlyRadio, pcPlayRandomlyLabel),
            div(this.#pcPlayOptimallyRadio, pcPlayOptimallyLabel)
        ));

        this.append(pcBehaviorDiv);
    }

    getPlayer(){
        if(this.#pcRadio.checked){
            return new PcPlayer(this.#role, this.#pcPlayOptimallyRadio.checked);
        }
        else{
            return new HumanPlayer(this.#role);
        }
    }
}

customElements.define('player-config', PlayerConfig);

export { PlayerConfig, HumanPlayer, PcPlayer, Player };