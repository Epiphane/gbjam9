import {
    Entity,
    State,
    Game,
    Sound,
} from "../../lib/juicy";
import { CoolText, FontFace } from "../components/cool-text";
import { ColorType, DarkColor, LightColor, PaletteManager } from "../helpers/palette";

export class PaletteSelectionScreen extends State {
    options: CoolText[] = [];

    palettesPerLine = 8;
    paletteSpacingX = 17;
    paletteSpacingY = 15;

    prevState?: State;

    padding = 10;

    constructor(prevState?: State) {
        super();

        this.prevState = prevState;

        const numPalettes = PaletteManager.numPalettes();

        for (let i = 0; i < numPalettes; i++) {
            const entity = new Entity(this, [CoolText]);
            const text = entity.get(CoolText)!;
            text.set({
                text: `${i + 1}`,
                showBackground: true,
                brightness: ColorType.Dark,
            });
            entity.position.x = 8 + (i % this.palettesPerLine) * this.paletteSpacingX;
            entity.position.y = 30 + Math.floor(i / this.palettesPerLine) * this.paletteSpacingY;
            this.options.push(text);
        }

        const title = new Entity(this, [CoolText]);
        title.get(CoolText)?.set({
            text: `Palette Selector`,
            fontFace: FontFace.Big,
        });
        title.position.x = Math.floor((Game.size.x - 2 * this.padding - title.width) / 2);
        title.position.y = 10;

        const cont = new Entity(this, [CoolText]);
        cont.get(CoolText)?.set({
            text: `Press A to continue`,
            fontFace: FontFace.Big,
        });
        cont.position.x = Math.floor((Game.size.x - 2 * this.padding - cont.width) / 2);
        cont.position.y = 100;

        // Load sounds
        Sound.Load('Menu_Move',
            {
                src: './audio/menu_move.ogg',
                isSFX: true,
                volume: 0.2
            });

        Sound.Load('Menu_Select',
            {
                src: './audio/menu_back.ogg',
                isSFX: true,
                volume: 0.2
            });

        Sound.Load('Menu_Appear',
            {
                src: './audio/menu_select.ogg',
                isSFX: true,
                volume: 0.2
            });
        Sound.Play('Menu_Appear');
    }

    key_UP() {
        const newPalette = PaletteManager.getCurrentId() - this.palettesPerLine;
        PaletteManager.setCurrent(newPalette);
        Sound.Play('Menu_Move');
    }

    key_LEFT() {
        const newPalette = PaletteManager.getCurrentId() - 1;
        PaletteManager.setCurrent(newPalette);
        Sound.Play('Menu_Move');
    }

    key_DOWN() {
        const newPalette = PaletteManager.getCurrentId() + this.palettesPerLine;
        PaletteManager.setCurrent(newPalette);
        Sound.Play('Menu_Move');
    }

    key_RIGHT() {
        const newPalette = PaletteManager.getCurrentId() + 1;
        PaletteManager.setCurrent(newPalette);
        Sound.Play('Menu_Move');
    }

    key_A() {
        this.close();
    }

    key_B() {
        this.close();
    }

    close() {
        Sound.Play('Menu_Select');
        if (this.prevState) {
            this.game.setState(this.prevState);
        }
    }

    update(dt: number) {
        super.update(dt);

        const currentId = PaletteManager.getCurrentId();
        this.options.forEach((opt, i) => {
            opt.set({
                brightness: i === currentId ? ColorType.Mid : ColorType.Dark,
                showBackground: i === currentId
            });
        })
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.prevState) {
            this.prevState.render(ctx);
        }

        ctx.save();
        ctx.translate(this.padding, this.padding);
        ctx.fillStyle = DarkColor;
        ctx.fillRect(-2, -2, this.game.size.x - 2 * this.padding + 4, this.game.size.y - 2 * this.padding + 4);
        ctx.fillStyle = LightColor;
        ctx.fillRect(0, 0, this.game.size.x - 2 * this.padding, this.game.size.y - 2 * this.padding);
        super.render(ctx);
        ctx.restore();
    }
};
