import {
    Entity,
    Game,
    State,
} from "../../lib/juicy";
import { CoolText } from "../components/cool-text";
import { SpriteComponent } from "../components/sprite";
import { DefaultFont } from "../helpers/constants";
import { ColorType, PaletteManager } from "../helpers/palette";
import { PaletteSelectionScreen } from "./palette-selector";

export class GameScreen extends State {
    text: CoolText;
    firstTime = true;

    constructor() {
        super();

        const text = new Entity(this);
        this.text = text.add(CoolText);
        this.text.set({
            text: 'Palette #0',
            size: 32,
            font: DefaultFont,
            showBackground: true,
            brightness: ColorType.Dark
        }).then(() => {
            text.position.x = (Game.size.x - text.width) / 2;
            text.position.y = 20;
            ppl.position.y = text.position.y + text.height;
        });

        const ppl = new Entity(this, 'player', [SpriteComponent]);
        const sprite = ppl.get(SpriteComponent)!;
        ppl.position.x = (Game.size.x - ppl.width) / 2;
        sprite.setImage('./images/player.png');
        sprite.setSize(32, 32);
        sprite.runAnimation([0, 1, 2, 1], 0.15, true);
    }

    init() {
        if (this.firstTime) {
            this.game.setState(new PaletteSelectionScreen(this));
            this.firstTime = false;
        }
    }

    key_START() {
        this.game.setState(new PaletteSelectionScreen(this));
    }

    update(dt: number) {
        super.update(dt);

        this.text.set({
            text: `Palette #${PaletteManager.getCurrentId() + 1}`,
        });
    }
};
