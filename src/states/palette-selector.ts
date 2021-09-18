import {
    Entity,
    State,
    Point,
} from "../../lib/juicy";
import { CoolText } from "../components/cool-text";
import { DefaultFont } from "../helpers/constants";
import { ColorType, PaletteManager } from "../helpers/palette";

export class PaletteSelectionScreen extends State {
    options: CoolText[] = [];

    palettesPerLine = 6;
    paletteSpacingX = 25;
    paletteSpacingY = 23;

    constructor() {
        super();

        const numPalettes = PaletteManager.numPalettes();

        for (let i = 0; i < numPalettes; i++) {
            const entity = new Entity(this, [CoolText]);
            const text = entity.get(CoolText)!;
            text.set({
                text: `${i + 1}`,
                font: DefaultFont,
                size: 24,
                // padding: new Point(1),
                showBackground: true,
                brightness: ColorType.Dark,
            });
            entity.position.x = 5 + (i % this.palettesPerLine) * this.paletteSpacingX;
            entity.position.y = 5 + Math.floor(i / this.palettesPerLine) * this.paletteSpacingY;
            this.options.push(text);
        }
    }

    key_W() {
        const newPalette = PaletteManager.getCurrentId() - this.palettesPerLine;
        PaletteManager.setCurrent(newPalette);
    }

    key_A() {
        const newPalette = PaletteManager.getCurrentId() - 1;
        PaletteManager.setCurrent(newPalette);
    }

    key_S() {
        const newPalette = PaletteManager.getCurrentId() + this.palettesPerLine;
        PaletteManager.setCurrent(newPalette);
    }

    key_D() {
        const newPalette = PaletteManager.getCurrentId() + 1;
        PaletteManager.setCurrent(newPalette);
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
};
