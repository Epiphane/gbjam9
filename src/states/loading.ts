import {
    Entity,
    Game,
    State,
    TextComponent,
} from "../../lib/juicy";
import { CoolText, FontFace } from "../components/cool-text";
import { DefaultFont } from "../helpers/constants";
import { __SKIP_CONTROLS__, __SKIP_PALETTE__ } from "../helpers/debug";
import { SaveManager } from "../helpers/save-manager";
import { ControlsScreen } from "./controls";
import { GameScreen } from "./game";
import { PaletteSelectionScreen } from "./palette-selector";

export class LoadingScreen extends State {

    constructor() {
        super();

        const textEntity = new Entity(this);
        const text = textEntity.add(CoolText);
        text.set({
            text: 'Loading...',
            fontFace: FontFace.Big,
        });
        textEntity.position.x = (Game.size.x - textEntity.width) / 2;
        textEntity.position.y = 20;
    }

    update(dt: number) {
        if (!__SKIP_CONTROLS__) {
            this.game.setState(new ControlsScreen());
        }
        else if (!__SKIP_PALETTE__) {
            this.game.setState(new PaletteSelectionScreen(new GameScreen()));
        }
        else {
            this.game.setState(new GameScreen());
        }
    }
};
