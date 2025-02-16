import { toKebabCase } from "common";

class InputTextarea extends HTMLElement {
    #id;
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
    constructor(id, caption, placeholder, rows){
        super();
        this.#id = toKebabCase(id);
        this.#caption = caption ?? 'Enter board configuration:';
        this.#placeholder = placeholder ?? '';
        this.#rows = rows ?? 2;
        this.#textarea = document.createElement('textarea');
    }

    connectedCallback(){
        if(this.#caption.length > 0){
            const label = document.createElement('label');
            label.innerText = this.#caption;
            label.htmlFor = `${this.#id}-input`;
            this.appendChild(label);
        }

        const textarea = this.#textarea;
        textarea.id = `${this.#id}-input`;
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

class InputNumber extends HTMLElement {
    #id;
    #caption;
    #placeholder;
    #input;

    /**
     * 
     * @param {string} caption 
     * @param {string} placeholder 
     */
    constructor(id, caption, placeholder, minValue, maxValue){
        super();
        this.#id = toKebabCase(id);
        this.#caption = caption ?? 'Enter a number:';
        this.#placeholder = placeholder ?? '';

        this.#input = document.createElement('input');
        this.#input.min = minValue;
        this.#input.max = maxValue;
    }
    
    connectedCallback(){
        if(this.#caption.length > 0){
            const label = document.createElement('label');
            // label.style.display = 'block';
            label.innerText = this.#caption;
            label.htmlFor = `${this.#id}-input`;
            this.appendChild(label);
        }
        
        const input = this.#input;
        input.type = 'number';
        input.min = 1;
        input.max = 10;
        input.step = 1;
        input.id = `${this.#id}-input`;
        input.placeholder = this.#placeholder;
        this.appendChild(input);
    }

    getValue(){
        return parseInt(this.#input.value);
    }

    /**
     * 
     * @param {number} value 
     */
    setValue(value){
        this.#input.value = value;
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
        span.style.display = 'block';
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

customElements.define('input-textarea', InputTextarea);
customElements.define('input-number', InputNumber);
customElements.define('input-format', InputFormat);
customElements.define('input-constraints', InputConstraints);

export { InputTextarea, InputNumber, InputFormat, InputConstraints };