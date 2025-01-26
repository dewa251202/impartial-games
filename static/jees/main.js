import { Constants } from "./common.js";
import { PileInput, InputState } from "./view/pile.js";
import { HumanPlayer, PcPlayer, PlayerConfig } from "./player.js";
import { Game } from "game";

class Screen {
    #inputStrategy;
    #game;
    #settingsOpened;

    constructor(inputStrategy, game){
        this.#inputStrategy = inputStrategy;
        this.#game = game;
        this.#settingsOpened = false;
        
        this.#initializeDialogs();
        this.#initializeSettings();

        this.#game.display();
    }

    #initializeSettings(){
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.querySelector('.backdrop');
        const settingsButton = document.querySelector('button.settings');
        const closeButton = sidebar.querySelector('.sidebar .close');

        const closeSidebar = () => {
            sidebar.style = '';
            backdrop.style = '';
            settingsButton.focus();
            this.#settingsOpened = false;
        }

        document.addEventListener('keyup', event => {
            if(event.key === "Escape" && this.#settingsOpened) closeSidebar();
        }, false);

        settingsButton.addEventListener('click', () => {
            sidebar.style = 'display: block;';
            backdrop.style = 'display: block;';
            closeButton.focus();
            this.#settingsOpened = true;
        });
        
        closeButton.addEventListener('click', () => {
            closeSidebar();
        });
    }

    #initializeNewGameDialog(){
        const newGameDialog = document.querySelector('dialog.new-game');
        const newGameButton = document.querySelector('button.new-game');
        const startGameButton = document.querySelector('button.start-game');

        const firstPlayerConfig = new PlayerConfig('First player', false);
        const secondPlayerConfig = new PlayerConfig('Second player', true);
        
        newGameButton.addEventListener('click', () => newGameDialog.showModal());
        startGameButton.addEventListener('click', () => {
            const result = this.#inputStrategy.parseValue();
            if(result.type === InputState.Invalid){
                return;
            }
            this.#game = new Game(result.piles, firstPlayerConfig.getPlayer(), secondPlayerConfig.getPlayer());
            this.#game.display();
            newGameDialog.close();
        });

        const playerConfigs = document.querySelector('.player');
        playerConfigs.appendChild(firstPlayerConfig);
        playerConfigs.appendChild(secondPlayerConfig);

        const gameInput = document.querySelector('.game .input');
        this.#inputStrategy.display(gameInput);
    }

    #initializeHowToPlayDialog(){
        const howToPlayDialog = document.querySelector('dialog.how-to-play');
        const howToPlayButtons = document.querySelectorAll('button.how-to-play');
        
        howToPlayDialog.querySelector('button.close').addEventListener('click', () => {
            howToPlayDialog.close();
        });
        
        howToPlayButtons.forEach(button => button.addEventListener('click', () => {
            howToPlayDialog.showModal();
        }));
    }

    #initializeDialogs(){
        this.#initializeNewGameDialog();
        this.#initializeHowToPlayDialog();
    }
}

function main(){
    console.log("halooo");
    const inputStrategy = new PileInput([
        'N = number of piles',
        'P<sub>i</sub> = number of items in the i-th pile',
        'N is at least 1 and at most 10',
        'P<sub>i</sub> is at least 0 and at most 15',
    ]);
    const game = new Game(Constants.DEFAULT_PILES);
    new Screen(inputStrategy, game);
}

main();