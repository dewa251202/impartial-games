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

class HumanPlayer extends Player {}

class PcPlayer extends Player {}

class PlayerConfig extends HTMLElement {
    #role;
    #kebabRole;
    #pcChecked;
    #pcRadio;

    /**
     * 
     * @param {string} role 
     * @param {boolean} pcChecked 
     */
    constructor(role, pcChecked){
        super();
        role ??= '';
        pcChecked ??= true;

        this.#role = role;
        this.#kebabRole = role.toLowerCase().replaceAll(/\s/gi, '-');
        this.#pcChecked = pcChecked;
        this.#pcRadio = document.createElement('input');
    }

    connectedCallback(){
        const span = document.createElement('span');
        span.innerText = `${this.#role} is`;
        this.appendChild(span);

        const humanDiv = document.createElement('div');

        const humanRadio = document.createElement('input');
        humanRadio.type = 'radio';
        humanRadio.id = `${this.#kebabRole}-human`;
        humanRadio.name = this.#kebabRole;
        humanRadio.value = 'human';
        if(!this.#pcChecked) humanRadio.checked = true;
        humanDiv.appendChild(humanRadio);

        const humanLabel = document.createElement('label');
        humanLabel.htmlFor = humanRadio.id;
        humanLabel.innerText = ' Human';
        humanDiv.appendChild(humanLabel);

        const pcDiv = document.createElement('div');
        const pcRadio = this.#pcRadio;
        pcRadio.type = 'radio';
        pcRadio.id = `${this.#kebabRole}-pc`;
        pcRadio.name = this.#kebabRole;
        pcRadio.value = 'pc';
        if(this.#pcChecked) pcRadio.checked = true;
        pcDiv.appendChild(pcRadio);

        const pcLabel = document.createElement('label');
        pcLabel.htmlFor = pcRadio.id;
        pcLabel.innerText = ' PC';
        pcDiv.appendChild(pcLabel);

        this.append(humanDiv);
        this.append(pcDiv);
        this.#pcRadio = pcRadio;
    }

    getPlayer(){
        return this.#pcRadio.checked ? new PcPlayer(this.#role) : new HumanPlayer(this.#role);
    }
}

customElements.define('player-config', PlayerConfig);

export { PlayerConfig, HumanPlayer, PcPlayer, Player };