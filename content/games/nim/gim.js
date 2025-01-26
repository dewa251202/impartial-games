import { PileInput } from "pile";
import { GameCombinations, SinglePileNim } from "base-game";
import { Controller } from "controller";

class Nim extends SinglePileNim {}

// const pileInput = new PileInput([
//     'N = number of piles',
//     'P<sub>i</sub> = number of items in the i-th pile',
//     'N is at least 1 and at most 10',
//     'P<sub>i</sub> is at least 0 and at most 15',
// ]);
// const game = new GameCombinations([new Nim(3), new Nim(5), new Nim(4)]);

// const controller = new Controller();
// controller.setGame(new Nim());
// controller.setInput(pileInput);

export { Game };