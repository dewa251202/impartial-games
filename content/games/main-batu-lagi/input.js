import { div, getRandomInt, InputState } from "common";
import { InputTextarea, InputConstraints, InputFormat } from "input/components.js";
import { BaseInput } from "input/base.js";

class Input extends BaseInput {
    #FORMAT_LINES = [
        'N M',
        'a<sub>2</sub> b<sub>2</sub>',
        'a<sub>3</sub> b<sub>3</sub>',
        '...',
        'a<sub>N</sub> b<sub>N</sub>',
        'c<sub>1</sub> c<sub>2</sub> ... c<sub>M</sub>'
    ];

    #cellCountBound;
    #itemCountBound;
    #placeholder;
    
    #inputTextarea;
    #inputFormat;
    #inputConstraints;

    constructor(cellCountBound, itemCountBound){
        super();
        this.#cellCountBound = cellCountBound;
        this.#itemCountBound = itemCountBound;

        const n = 7;
        const m = 4;
        const nextCells = [
            [1, 1],
            [1, 2],
            [1, 3],
            [4, 4],
            [4, 4],
            [4, 6]
        ];
        const positions = [3, 5, 5, 6];
        this.defaultValue = [
            n, m,
            nextCells,
            positions
        ];
        this.#placeholder = this.#convertValueToString(this.defaultValue);
    }

    connectedCallback(){
        const [minCell, maxCell] = this.#cellCountBound;
        const [minItem, maxItem] = this.#itemCountBound;

        const constraints = [
            `N = number of cells`,
            `M = number of items`,
            `N is at least ${minCell} and at most ${maxCell}`,
            `M is at least ${minItem} and at most ${maxItem}`,
            `a<sub>i</sub> and b<sub>i</sub> = leftmost and rightmost cell number that item at i-th cell can be moved to`,
            `c<sub>k</sub> = initial position of k-th item`,
            `1 ≤ a<sub>i</sub> ≤ b<sub>i</sub> < i`,
            `For each pair of cell number (i, j) where i < j: a<sub>i</sub> ≤ a<sub>j</sub> and b<sub>i</sub> ≤ b<sub>j</sub>`,
            `1 ≤ c<sub>k</sub> ≤ N`,
        ];

        this.#inputTextarea = new InputTextarea('main-batu-lagi', undefined, this.#placeholder, this.#FORMAT_LINES.length);
        this.#inputFormat = new InputFormat(this.#FORMAT_LINES);
        this.#inputConstraints = new InputConstraints(constraints);

        this.appendChild(this.#inputTextarea);
        this.appendChild(this.createRandomButton());
        this.appendChild(div(this.#inputFormat));
        this.appendChild(this.#inputConstraints);
    }

    parseValue(){
        const inputValue = this.#inputTextarea.getValue();
        if(inputValue === '') this.setValue(this.#placeholder);
        const lines = inputValue
            .split(/\r\n|\r|\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
        if(lines.length < 1){
            return { type: InputState.Invalid, message: 'At least one non-empty line to determine N and M' };
        }

        const firstLine = lines[0].split(/\s/);
        if(firstLine.length > 2){
            console.warn('More than 2 tokens in first line');
        }
        const [N, M] = firstLine.map(t => parseInt(t));
        if(Number.isNaN(N)) return { type: InputState.Invalid, message: `N = ${firstLine[0]} is not a number` };
        if(Number.isNaN(M)) return { type: InputState.Invalid, message: `M = ${firstLine[1]} is not a number` };

        const [minCell, maxCell] = this.#cellCountBound;
        const [minItem, maxItem] = this.#itemCountBound;
        if(!(minCell <= N && N <= maxCell))  return { type: InputState.Invalid, message: `N = ${N} violates the constraint` };
        if(!(minItem <= M && M <= maxItem))  return { type: InputState.Invalid, message: `M = ${M} violates the constraint` };

        const nextCells = [];
        for(let i = 1; i < N; i++){
            if(lines[i] === undefined){
                return { type: InputState.Invalid, message: `Failed to retrieve next cell bound for ${i + 1}-th cell` };
            }
            
            const line = lines[i].split(/\s/);
            if(line.length > 2) console.warn(`There are more than 2 tokens to parse a_${i + 1} and b_${i + 1}`);

            const [ai, bi] = line.map(t => parseInt(t));
            if(Number.isNaN(ai)) return { type: InputState.Invalid, message: `a_${i + 1} = ${line[0]} is not a number` };
            if(Number.isNaN(bi)) return { type: InputState.Invalid, message: `b_${i + 1} = ${line[1]} is not a number` };
            
            if(!(1 <= ai && ai <= bi && bi < i + 1)){
                return {
                    type: InputState.Invalid,
                    message: `a_${i + 1} and b_${i + 1} violates constraint: 1 ≤ ${ai} ≤ ${bi} < ${i + 1}`
                };
            }
            
            if(i > 1){
                const [lai, lbi] = nextCells.at(-1);
                if(!(lai <= ai && lbi <= bi)){
                    return {
                        type: InputState.Invalid,
                        message: `a_${i + 1} and b_${i + 1} violates constraint: a_${i} = ${lai} ≤ ${ai} and b_${i} = ${lbi} ≤ ${bi}`
                    };
                }
            }

            nextCells.push([ai, bi]);
        }

        if(lines[N] === undefined){
            return { type: InputState.Invalid, message: `Failed to retrieve initial position` };
        }

        const lastLine = lines[N].split(/\s/);
        if(lastLine.length < M) return { type: InputState.Invalid, message: `There are less than ${M} item positions specified` };
        if(lastLine.length > M) console.warn(`There are more than ${M} tokens`);

        const positions = [];
        for(let k = 0; k < M; k++){
            const position = parseInt(lastLine[k]);
            if(Number.isNaN(position)){
                return { type: InputState.Invalid, message: `c_${k + 1} = ${lastLine[k]} is not a number` };
            }
            
            if(!(1 <= position && position <= N)){
                return { type: InputState.Invalid, message: `c_${k + 1} = ${position} violates the constraint` };
            }

            positions.push(position);
        }

        if(lines[N + 1] !== undefined) console.warn('There are unparsed tokens');

        return this.valid([
            N, M,
            nextCells,
            positions
        ]);
    }

    generateRandomInputValue(){
        const [minCell, maxCell] = this.#cellCountBound;
        const [minItem, maxItem] = this.#itemCountBound;

        const n = getRandomInt(minCell, maxCell);
        const m = getRandomInt(minItem, maxItem);

        const nextCells = [[1, 1]];
        for(let i = 1; i < n; i++){
            const bi = getRandomInt(nextCells[i - 1][1], i);
            const ai = getRandomInt(nextCells[i - 1][0], bi);
            nextCells.push([ai, bi]);
        }
        nextCells.shift();

        const positions = [];
        for(let i = 0; i < m; i++){
            positions.push(getRandomInt(1, n));
        }

        this.setValue([
            n, m,
            nextCells,
            positions
        ]);
    }

    #convertValueToString(value){
        const [n, m, nextCells, position] = value;
        const nextCellsStr = nextCells.map(([a, b]) => `${a} ${b}`).join('\n');
        return `${n} ${m}\n${nextCellsStr}\n${position.join(' ')}`;
    }
    
    setValue(value){
        this.#inputTextarea.setValue(this.#convertValueToString(value));
    }

    clearValue(){
        this.#inputTextarea.setValue('');
    }
}

customElements.define('input-main-batu-lagi', Input);

export { Input };