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

        return this; // enable chaining
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
        const maxX = this.wrapLength ? x + this.wrapLength * this.font.width : undefined;
        for (let c = 0; c < this.text.length; c++) {
            const code = this.text.charCodeAt(c);
            if (cursor.x === x && code === 32) {
                continue;
            }

            // Should we wrap?
            if (maxX && cursor.x !== x && code !== 32) {
                let c2;
                for (c2 = c; c2 < this.text.length; c2 ++) {
                    if (this.text.charCodeAt(c2) === 32) {
                        break;
                    }
                }

                const wordWidth = c2 - c;
                if (cursor.x + wordWidth * this.font.width >= maxX) {
                    cursor.x = x;
                    cursor.y += this.font.height;
                }
            }

            this.drawCharacter(ctx, this.text.charCodeAt(c), this.font, this.brightness, cursor);
            cursor.x += this.font.width;

            if (maxX && cursor.x >= maxX) {
                cursor.x = x;
                cursor.y += this.font.height;
            }
        }
    }
}
