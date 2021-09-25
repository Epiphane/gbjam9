import { VaniaScreen } from "./vania";

export class TestScreen extends VaniaScreen {
    constructor() {
        super();

        this.loadLevel('test');
    }
};
