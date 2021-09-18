import { Component, Point } from "../../lib/juicy";
import { ColorFromType, ColorType, DarkColor, LightColor, LowColor, MidColor } from "../helpers/palette";

class Font {
    font = new Image();
    height: number;
    width: number;
    pad: number = 1;

    constructor(src: string, width: number, height: number, pad?: number) {
        this.font.src = src;
        this.width = width;
        this.height = height;
        if (typeof(pad) !== 'undefined') {
            this.pad = pad;
        }
    }
}

const A = 'A'.charCodeAt(0);
const Z = 'Z'.charCodeAt(0);
const a = 'a'.charCodeAt(0);
const z = 'z'.charCodeAt(0);
const _0 = '0'.charCodeAt(0);
const _9 = '9'.charCodeAt(0);
const period = '.'.charCodeAt(0);
const exclaim = '!'.charCodeAt(0);
const question = '?'.charCodeAt(0);

export enum FontFace {
    Normal = 0,
    Big,
}

const fonts: { [key: number]: Font } = {
    [FontFace.Normal]: new Font('./images/font.png', 4, 6),
    [FontFace.Big]: new Font('./images/font-big.png', 6, 9),
};

interface CoolTextInfo {
    fontFace: FontFace;
    text: string;
    padding: Point;
    wrapLength?: number;
    showBackground: boolean;
    brightness: ColorType;
}

export interface CoolText extends CoolTextInfo {}
export class CoolText extends Component {
    fontFace = FontFace.Normal;
    text = '';
    padding = new Point(0);
    showBackground = false;
    brightness = ColorType.Dark;

    font = fonts[FontFace.Normal];
    letterWidth = 3;
    letterHeight = 5;

    set(info: Partial<CoolTextInfo>) {
        Object.assign(this, info);
        this.text = this.text.toLocaleLowerCase();

        let width = this.text.length;
        let height = 1;
        if (this.wrapLength && this.text.length > this.wrapLength) {
            width = this.wrapLength;
            height = Math.ceil(this.text.length / this.wrapLength);
        }

        this.font = fonts[this.fontFace];
        this.entity.width = width * this.font.width - this.font.pad;
        this.entity.height = height * this.font.height - this.font.pad;

        return Promise.resolve();
    }

    drawCharacter(ctx: CanvasRenderingContext2D, charCode: number, font: Font, brightness: ColorType, pos: Point) {
        if (charCode === 32) {
            // Space
            return;
        }
        else if (charCode >= A && charCode <= Z) {
            charCode -= A;
        }
        else if (charCode >= a && charCode <= z) {
            charCode -= a;
        }
        else if (charCode >= _0 && charCode <= _9) {
            charCode -= _0;
            charCode += 26; // To go to numbers
        }
        else if (charCode === exclaim) {
            charCode = 36;
        }
        else if (charCode === question) {
            charCode = 37;
        }
        else if (charCode === period) {
            charCode = 38;
        }

        ctx.drawImage(
            font.font,
            // source
            charCode * font.width,
            brightness * font.height,
            font.width,
            font.height,
            // dest
            pos.x,
            pos.y,
            font.width,
            font.height
        );
    }

    render(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        if (this.showBackground) {
            if (this.brightness === ColorType.Dark) {
                ctx.fillStyle = LightColor;
            }
            else {
                ctx.fillStyle = DarkColor;
            }
            ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
        }

        const cursor = new Point(x, y);
        for (let c = 0; c < this.text.length; c++) {
            this.drawCharacter(ctx, this.text.charCodeAt(c), this.font, this.brightness, cursor);
            cursor.x += this.font.width;

            if (this.wrapLength && (c + 1) % this.wrapLength === 0) {
                cursor.x = x;
                cursor.y += this.font.height;
            }
        }
    }
}
