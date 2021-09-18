import {
    Entity,
    Game,
    State,
    Point,
} from "../../lib/juicy";
import { CoolText, FontFace } from "../components/cool-text";
import { SpriteComponent } from "../components/sprite";
import { Keys } from "../helpers/constants";
import { ColorType, PaletteManager } from "../helpers/palette";
import { PaletteSelectionScreen } from "./palette-selector";

export class GameScreen extends State {
    text: CoolText;
    player: Entity;

    constructor() {
        super();

        {
            const text = new Entity(this);
            this.text = text.add(CoolText);
            this.text.set({
                text: `Palette #${PaletteManager.getCurrentId() + 1}`,
                brightness: ColorType.Dark,
                fontFace: FontFace.Big,
            })
            text.position.x = (Game.size.x - text.width) / 2;
            text.position.y = 20;
        }

        {
            const text = new Entity(this);
            text.add(CoolText).set({
                text: `Press SELECT to change palette`,
                brightness: ColorType.Dark,
                fontFace: FontFace.Big,
                wrapLength: 18,
            })
            text.position.x = (Game.size.x - text.width) / 2;
            text.position.y = 100;
        }

        {
            this.player = new Entity(this, 'player', [SpriteComponent]);
            const sprite = this.player.get(SpriteComponent)!;
            sprite.onload = () => {
                this.player.position.x = (Game.size.x - this.player.width) / 2;
            }
            this.player.position.y = 40;
            sprite.setImage('./images/player.png');
            sprite.setSize(32, 32);
            sprite.runAnimation([0, 1, 2, 1], 0.15, true);
        }
    }

    init() {
        this.text.set({
            text: `Palette ${PaletteManager.getCurrentId() + 1}`,
        });
    }

    key_SELECT() {
        this.game.setState(new PaletteSelectionScreen(this));
    }

    update(dt: number) {
        super.update(dt);

        let newDir;
        if (this.game.keyDown(Keys.UP)) {
            newDir = 3;
        }
        else if (this.game.keyDown(Keys.LEFT)) {
            newDir = 1;
        }
        else if (this.game.keyDown(Keys.DOWN)) {
            newDir = 0;
        }
        else if (this.game.keyDown(Keys.RIGHT)) {
            newDir = 2;
        }

        if (typeof(newDir) !== 'undefined' && newDir !== this.player.props.dir) {
            this.player.props.dir = newDir;

            const base = newDir * 9;
            this.player.get(SpriteComponent)?.runAnimation([base, base + 1, base + 2, base + 1], 0.15, true);
        }
    }
};
