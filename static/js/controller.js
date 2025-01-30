import { Button, Dialog, Sidebar } from "view/components.js";
import { GameState } from "game";
import { InputState } from "common";

// This is not exactly controller, but a mediator. Well, whatever.
class Controller {
    #board;
    #inputs;
    
    #newGameButton;
    #startGameButton;
    #settingsButton;
    #headerHowToPlayButton;
    #dialogHowToPlayButton;
    #howToPlayCloseButton;

    #newGameDialog;
    #howToPlayDialog;

    #firstPlayerConfig;
    #secondPlayerConfig;

    #settingsSidebar;

    #gameStatus;

    /**
     * 
     * @param {import("common").InputStrategy[]} inputs 
     * @param {import("common").Board} board 
     * @param  {...any} initialGameStateArgs 
     */
    constructor(inputs, board){
        board.setController(this);

        this.#board = board;
        this.#inputs = inputs;

        this.#newGameButton = new Button('button.new-game', this);
        this.#headerHowToPlayButton = new Button('.header button.how-to-play', this);
        this.#dialogHowToPlayButton = new Button('dialog button.how-to-play', this);
        this.#startGameButton = new Button('button.start-game', this);
        this.#settingsButton = new Button('button.settings', this);
        this.#howToPlayCloseButton = new Button('dialog button.close', this);

        this.#newGameDialog = new Dialog('dialog.new-game', this);
        this.#howToPlayDialog = new Dialog('dialog.how-to-play', this);

        this.#firstPlayerConfig = document.getElementById('first-player-config');
        this.#secondPlayerConfig = document.getElementById('second-player-config');

        this.#settingsSidebar = new Sidebar('.sidebar');

        this.#gameStatus = document.querySelector('game-status');

        this.#attachComponents();
    }

    /**
     * 
     * @param {any} sender 
     * @param {Event} event 
     * @returns 
     */
    notify(sender, event){
        if(sender === this.#newGameButton){
            this.#newGameDialog.show();
        }
        else if(sender === this.#headerHowToPlayButton || sender === this.#dialogHowToPlayButton){
            this.#howToPlayDialog.show();
        }
        else if(sender === this.#howToPlayCloseButton){
            this.#howToPlayDialog.close();
        }
        else if(sender === this.#startGameButton){
            const results = this.#inputs.map(input => input.parseValue());
            if(results.some(result => result.type === InputState.Invalid)){
                return;
            }
            const args = results.map(result => result.data);
    
            const firstPlayer = this.#firstPlayerConfig.getPlayer();
            const secondPlayer = this.#secondPlayerConfig.getPlayer();
            const gameState = new GameState(...args);
            gameState.players = [firstPlayer, secondPlayer];
    
            this.#board.clear();
            this.#board.setGameState(gameState);
            this.#gameStatus.reset();
            this.#newGameDialog.close();
        }
        else if(sender === this.#settingsButton){
            this.#settingsSidebar.open();
        }
        else if(sender === this.#board){
            const { type, detail: { previousPlayer, currentPlayer, moveMessage } } = event;
            if(type === 'gamefinished'){
                console.log(previousPlayer.getRole() + ' won');
            }
            else if(type === 'gametype'){
                console.log(event.detail.isWinning ? 'Winning game' : 'Losing game');
            }
            else{
                this.#gameStatus.setMove(moveMessage);
                if(type === 'aftermove'){
                    this.#gameStatus.setPlayerTurn(currentPlayer.getRole());
                }
            }
        }
    }

    #attachComponents(){
        const gameInput = document.querySelector('.game .input');
        for(const input of this.#inputs){
            gameInput.appendChild(input);
        }
        
        const gameBoard = document.querySelector('.game .board');
        gameBoard.appendChild(this.#board);
    }
}

export { Controller };