import {
    Entity,
    Game,
    ImageComponent,
    State,
} from "../../lib/juicy";
import { CoolText } from "../components/cool-text";
import { SpriteComponent } from "../components/sprite";
import { DefaultFont } from "../helpers/constants";
import { ColorType, PaletteManager } from "../helpers/palette";
import { GameScreen } from "./game";
import { PaletteSelectionScreen } from "./palette-selector";

export class ControlsScreen extends State {
    constructor() {
        super();

        const background = new Entity(this, [ImageComponent]);
        background.get(ImageComponent)?.setImage('./images/controls.png');
    }

    key_A() {
        this.game.setState(new PaletteSelectionScreen(this));
    }
};
