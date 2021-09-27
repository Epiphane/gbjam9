import { Load } from "juicy.sound";
import {
    Entity,
    ImageComponent,
    Sound,
    State,
} from "../../lib/juicy";
import { GameScreen } from "./game";
import { PaletteSelectionScreen } from "./palette-selector";

export class ControlsScreen extends State {
    constructor() {
        super();

        const background = new Entity(this, [ImageComponent]);
        background.get(ImageComponent)?.setImage('./images/controls.png');
    }

    key_A() {
        this.game.setState(new PaletteSelectionScreen(new GameScreen()));
        Sound.Load('Back', {
            src: './audio/menu_back.ogg',
            isSFX: true,
            volume: 0.2
        });
        Sound.Play('Back');
    }
};
