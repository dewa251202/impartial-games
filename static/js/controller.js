import { GameCombinations, SinglePileNim } from "base-game";
import { PileInput } from "pile";
import { Button } from "components";
import { Game } from "game";
import { PlayerConfig } from "./player.js";

class Controller {
    #game;
    #input;
    #startGameButton;
    #firstPlayerConfig;
    #secondPlayerConfig;

    constructor(){
        this.#startGameButton = new Button('button.start-game', this);
        this.#firstPlayerConfig = new PlayerConfig('First player', false);
        this.#secondPlayerConfig = new PlayerConfig('Second player', true);
    }

    notify(sender, event){
        if(sender === this.#startGameButton){
            if(event.type === 'click'){
                const result = this.#input.parseValue();
                if(result.type === InputState.Invalid){
                    return;
                }
                this.#game = new GameCombinations();
                // this.#game.display();
                newGameDialog.close();
            }
        }
    }

    /**
     * 
     * @param {PileInput} input
     */
    setInput(input){
        input.setController(this);
        this.#input = input;
    }

    /**
     * 
     * @param {SinglePileNim} game 
     */
    setGame(game){
        this.#game = game;
    }
}

export { Controller };