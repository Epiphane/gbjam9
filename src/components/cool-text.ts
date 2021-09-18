import { TextComponent, TextInfo } from "../../lib/juicy";
import { ColorFromType, ColorType, DarkColor, LightColor, LowColor, MidColor } from "../helpers/palette";

export interface CoolTextInfo {
    showBackground: boolean;
    brightness: ColorType;
}

export interface CoolText extends CoolTextInfo {}
export class CoolText extends TextComponent {
    showBackground = false;
    brightness = ColorType.Dark;

    set(info: Partial<CoolTextInfo & TextInfo>): Promise<void> {
        Object.assign(this, info);

        if (info.brightness) {
            info.fillStyle = ColorFromType(info.brightness, info.fillStyle);
        }

        return super.set(info);
    }

    render(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        if (this.showBackground) {
            if (this.brightness === ColorType.Dark) {
                ctx.fillStyle = LightColor;
                ctx.fillRect(x, y, w, h);
            }
            else {
                ctx.fillStyle = DarkColor;
                ctx.fillRect(x, y, w, h);
            }
        }

        super.render(ctx, x, y, w, h);
    }
}