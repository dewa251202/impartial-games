import { BaseGameState } from "base-game";
import { div, toKebabCase } from "common";

class Player {
    role;

    /**
     * 
     * @param {string} role 
     */
    constructor(role){
        this.role = role;
    }

    getRole(){
        return this.role;
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

    toConfig(){
        return new PlayerConfig(this.role, false, false, this);
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
        const nextState = this.#playOptimally ? gameState.getRandomOptimalNextState() : gameState.getRandomNextState();
        return board.doPcPlayerTurn(nextState);
    }

    toConfig(){
        return new PlayerConfig(this.role, true, this.#playOptimally, this);
    }
}

class PlayerConfig extends HTMLElement {
    #role;
    #kebabRole;
    #humanRadio;
    #pcRadio;
    #pcPlayRandomlyRadio;
    #pcPlayOptimallyRadio;
    #assocPlayer;

    /**
     * 
     * @param {string} role 
     * @param {boolean} [pcChecked] 
     * @param {boolean} [pcPlayOptimallyChecked] 
     * @param {Player} [assocPlayer] 
     */
    constructor(role, pcChecked = true, pcPlayOptimallyChecked = false, assocPlayer){
        super();

        this.#role = role ?? '';
        this.#kebabRole = toKebabCase(role);
        
        this.#pcRadio = document.createElement('input');
        this.#pcRadio.type = 'radio';
        this.#pcRadio.id = `${this.#kebabRole}-pc`;
        this.#pcRadio.name = this.#kebabRole;
        this.#pcRadio.value = 'pc';
        if(pcChecked) this.#pcRadio.checked = true;

        this.#humanRadio = document.createElement('input');
        this.#humanRadio.type = 'radio';
        this.#humanRadio.id = `${this.#kebabRole}-human`;
        this.#humanRadio.name = this.#kebabRole;
        this.#humanRadio.value = 'human';
        if(!pcChecked) this.#humanRadio.checked = true;

        this.#pcPlayRandomlyRadio = document.createElement('input');
        this.#pcPlayRandomlyRadio.type = 'radio';
        this.#pcPlayRandomlyRadio.id = `${this.#kebabRole}-pc-random`;
        this.#pcPlayRandomlyRadio.name = `${this.#kebabRole}-pc-behavior`;
        this.#pcPlayRandomlyRadio.value = 'random';
        if(!pcPlayOptimallyChecked) this.#pcPlayRandomlyRadio.checked = true;

        this.#pcPlayOptimallyRadio = document.createElement('input');
        this.#pcPlayOptimallyRadio.type = 'radio';
        this.#pcPlayOptimallyRadio.id = `${this.#kebabRole}-pc-optimal`;
        this.#pcPlayOptimallyRadio.name = `${this.#kebabRole}-pc-behavior`;
        this.#pcPlayOptimallyRadio.value = 'optimal';
        if(pcPlayOptimallyChecked) this.#pcPlayOptimallyRadio.checked = true;
        
        this.#assocPlayer = assocPlayer;
    }

    connectedCallback(){
        const roleSpan = document.createElement('span');
        roleSpan.innerText = `${this.#role} is`;
        this.appendChild(roleSpan);
        
        const humanLabel = document.createElement('label');
        humanLabel.htmlFor = this.#humanRadio.id;
        humanLabel.innerText = ' Human';
        this.appendChild(div(this.#humanRadio, humanLabel));
        
        const pcLabel = document.createElement('label');
        pcLabel.htmlFor = this.#pcRadio.id;
        pcLabel.innerText = ' PC';
        this.appendChild(div(this.#pcRadio, pcLabel));

        this.#humanRadio.addEventListener('input', () => pcBehaviorDiv.style.display = 'none');
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
        if(this.#assocPlayer) return this.#assocPlayer;
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