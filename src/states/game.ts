import { VaniaScreen } from "./vania";

export class GameScreen extends VaniaScreen {
    constructor() {
        super();

        this.loadLevel('intro');
    }
};
