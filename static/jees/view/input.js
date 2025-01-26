class InputArea extends HTMLElement {
    #caption;
    #rows;
    #placeholder;
    #textarea;

    /**
     * 
     * @param {string} caption 
     * @param {string} placeholder 
     * @param {number} rows 
     */
    constructor(caption, placeholder, rows){
        super();
        this.#caption = caption ?? 'Enter board configuration:';
        this.#placeholder = placeholder ?? '';
        this.#rows = rows ?? 2;
        this.#textarea = document.createElement('textarea');
    }

    connectedCallback(){
        if(this.#caption.length > 0){
            const label = document.createElement('label');
            label.innerText = this.#caption;
            label.htmlFor = 'game-input';
            this.appendChild(label);
        }

        const textarea = this.#textarea;
        textarea.id = 'game-input';
        textarea.rows = this.#rows;
        textarea.placeholder = this.#placeholder;
        this.appendChild(textarea);
    }

    getValue(){
        return this.#textarea.value;
    }

    /**
     * 
     * @param {string} value 
     */
    setValue(value){
        this.#textarea.value = value;
    }
}

class InputFormat extends HTMLElement {
    #formatLines;
    
    constructor(formatLines){
        super();
        this.#formatLines = formatLines ?? [];
    }

    connectedCallback(){
        const span = document.createElement('span');
        span.innerText = 'Format:';
        this.appendChild(span);

        const formatBox = document.createElement('div');
        formatBox.classList.add('input-format');
        const div = document.createElement('div');
        div.innerHTML = this.#formatLines.join('<br>');
        formatBox.appendChild(div);
        this.appendChild(formatBox);
    }
}

class InputConstraints extends HTMLElement {
    #constraints;
    
    constructor(constraints){
        super();
        this.#constraints = constraints ?? [];
    }

    connectedCallback(){
        const span = document.createElement('span');
        span.innerText = 'where';
        this.appendChild(span);

        const ul = document.createElement('ul');
        ul.classList.add('constraints');
        this.appendChild(ul);

        this.#constraints.forEach(constraint => {
            const li = document.createElement('li');
            li.innerHTML = constraint;
            ul.appendChild(li);
        });
    }
}

customElements.define('input-area', InputArea);
customElements.define('input-format', InputFormat);
customElements.define('input-constraints', InputConstraints);

export { InputArea, InputFormat, InputConstraints };