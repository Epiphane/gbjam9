import { Game } from "../../lib/juicy";
import { SaveManager } from "../helpers/save-manager";
import { VaniaScreen } from "./vania";

export class GameScreen extends VaniaScreen {
    constructor() {
        super();

        this.loadLevel(
            SaveManager.get('levelName') ?? 'egg0',
            SaveManager.get('levelFrom')
        );
    }

    respawn() {
        super.respawn();

        this.loadLevel(
            SaveManager.get('levelName') ?? 'egg0',
            SaveManager.get('levelFrom')
        );

        Game.setState(new GameScreen());
    }

    loadLevel(name: string, from?: string) {
        SaveManager.set('levelName', name);
        SaveManager.set('levelFrom', from);

        super.loadLevel(name, from);
    }
};
