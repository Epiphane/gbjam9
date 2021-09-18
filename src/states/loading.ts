import {
    BoxComponent,
    Entity,
    Game,
    State,
    TextComponent,
} from "../../lib/juicy";
import { ColoredSpriteComponent } from "../components/colored_sprite";
import { SpriteComponent } from "../components/sprite";
import { PaletteManager } from "../helpers/palette";

export default class LoadingScreen extends State {
    text: TextComponent;

    countdown = 1.2;

    constructor() {
        super();

        const text = new Entity(this);
        this.text = text.add(TextComponent);
        this.text.set({
            text: 'Loading...',
            fillStyle: 'black',
            size: 32,
            font: 'Poiret One'
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

    update(dt: number) {
        super.update(dt);

        this.countdown -= dt;
        if (this.countdown < 0) {
            this.countdown = 1.2;

            PaletteManager.setCurrent(PaletteManager.getCurrentId() + 1);
            this.text.set({ text: `Palette #${PaletteManager.getCurrentId()}`})
        }
    }
};
