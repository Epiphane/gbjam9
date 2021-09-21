import { VaniaScreen } from "./vania";

export class TestScreen extends VaniaScreen {
    constructor() {
        super();

        this.loadLevel(localStorage.getItem('currentLevel') || 'test');
    }

    loadLevel(name: string, from?: string) {
        localStorage.setItem('currentLevel', name);
        super.loadLevel(name, from);
    }
};
