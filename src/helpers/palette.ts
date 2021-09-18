import { FillStyle, Game, rand } from "../../lib/juicy";

export type Color = [r: number, g: number, b: number, a: number];
export type Palette = [light: Color, mid: Color, low: Color, dark: Color];
export enum ColorType {
    Dark = 0,
    Low,
    Mid,
    Light,
};

type ImageAndCanvas = {
    template: HTMLCanvasElement | HTMLImageElement;
    destination: HTMLCanvasElement;
}

export const DarkColor = 'rgba(0, 0, 0, 255)';
export const LowColor = 'rgba(85, 85, 85, 255)';
export const MidColor = 'rgba(170, 170, 170, 255)';
export const LightColor = 'rgba(255, 255, 255, 255)';

export const ColorFromType = (type?: ColorType, backup?: FillStyle): FillStyle => {
    switch (type)
    {
    case ColorType.Dark:
        return DarkColor;
    case ColorType.Low:
        return LowColor;
    case ColorType.Mid:
        return MidColor;
    case ColorType.Light:
        return LightColor;
    }

    return backup || LightColor;
}

class PaletteManager {
    private palettes: Palette[] = [
        [[224, 248, 208, 255], [136, 192, 112, 255], [52, 104, 86, 255], [8, 24, 32, 255]],
        [[211, 251, 238, 255], [84, 212, 147, 255], [42, 164, 48, 255], [78, 49, 28, 255]],
        [[255, 104, 13, 255], [173, 53, 25, 255], [138, 20, 51, 255], [32, 25, 91, 255]],
        [[178, 189, 1, 255], [128, 108, 18, 255], [97, 50, 15, 255], [55, 18, 64, 255]],
        [[91, 200, 200, 255], [35, 106, 106, 255], [84, 28, 28, 255], [40, 13, 13, 255]],
        [[215, 130, 130, 255], [154, 51, 51, 255], [19, 58, 58, 255], [8, 25, 25, 255]],
        [[78, 201, 223, 255], [99, 161, 208, 255], [53, 118, 167, 255], [52, 73, 134, 255]],    // GOOD
        [[144, 184, 248, 255], [95, 133, 219, 255], [53, 57, 65, 255], [38, 40, 43, 255]],      // GOOD
        [[65, 216, 191, 255], [47, 137, 179, 255], [59, 80, 178, 255], [34, 87, 99, 255]],      // GOOD
        [[230, 161, 87, 255], [201, 117, 61, 255], [151, 58, 58, 255], [91, 37, 45, 255]],      // VERY GOOD
        [[91, 170, 236, 255], [82, 110, 208, 255], [72, 76, 176, 255], [51, 66, 91, 255]],      // GOOD
        [[122, 129, 235, 255], [89, 149, 151, 255], [80, 74, 167, 255], [37, 51, 97, 255]],     // NOT BAD
        [[150, 201, 156, 255], [85, 130, 156, 255], [72, 87, 145, 255], [58, 49, 110, 255]],    // OK
        [[228, 193, 68, 255], [223, 121, 67, 255], [194, 75, 57, 255], [105, 63, 39, 255]],     // GOOD
        [[227, 181, 135, 255], [201, 140, 112, 255], [69, 102, 114, 255], [49, 67, 87, 255]],   // GOOD
        [[232, 69, 69, 255], [144, 55, 73, 255], [83, 53, 74, 255], [43, 46, 74, 255]],         // OK
        [[217, 178, 110, 255], [156, 86, 61, 255], [101, 69, 52, 255], [61, 50, 44, 255]],      // VERY GOOD
        [[243, 188, 119, 255], [165, 82, 51, 255], [64, 42, 35, 255], [29, 23, 22, 255]],       // AHHHH YESS
        [[235, 191, 88, 255], [118, 147, 83, 255], [61, 101, 93, 255], [51, 72, 77, 255]],      // NOT BAD
        [[213, 128, 188, 255], [199, 63, 101, 255], [70, 50, 43, 255], [42, 34, 30, 255]],      // AITE
        [[255, 160, 125, 255], [195, 121, 94, 255], [126, 95, 66, 255], [62, 61, 45, 255]],     // GOOD
        [[78, 201, 187, 255], [70, 150, 176, 255], [59, 129, 90, 255], [68, 88, 48, 255]],      // GOOD
        [[76, 95, 122, 255], [57, 62, 111, 255], [61, 46, 79, 255], [50, 29, 47, 255]],         // ALRIGHT
        [[150, 134, 134, 255], [115, 103, 112, 255], [73, 73, 78, 255], [53, 58, 59, 255]],     // GOOD
        [[57, 70, 68, 255], [45, 53, 57, 255], [32, 39, 48, 255], [22, 21, 39, 255]],           // VERY GOOD
        [[215, 137, 215, 255], [157, 101, 201, 255], [93, 84, 164, 255], [42, 61, 102, 255]],   // GOOD
        [[99, 156, 217, 255], [84, 84, 197, 255], [52, 32, 86, 255], [34, 14, 36, 255]],        // GOOD
        [[68, 74, 61, 255], [44, 57, 47, 255], [49, 44, 42, 255], [29, 39, 40, 255]],           // VERY GOOD
        [[218, 183, 96, 255], [162, 130, 67, 255], [98, 131, 60, 255], [43, 50, 54, 255]],      // GOOD
        [[90, 115, 113, 255], [64, 82, 74, 255], [70, 63, 69, 255], [54, 41, 45, 255]],         // GOOD
        [[232, 69, 69, 255], [144, 55, 73, 255], [83, 53, 74, 255], [43, 46, 74, 255]],         // GOOD
        [[255, 255, 255, 255], [170, 170, 170, 255], [85, 85, 85, 255], [0, 0, 0, 255]],
    ];

    private current = parseInt(localStorage.getItem('palette') || `0`);

    private templates: { [key: string]: ImageAndCanvas } = {};
    private nextTemplateId = 0;

    private listeners: ((palette: Palette) => any)[] = [];

    loadImage(src: string) {
        const img = document.createElement('canvas');
        const template = new Image();
        template.src = src;
        template.onload = (ev: Event) => {
            this.applyPalette(template, img);

            if (img.onload) {
                img.onload(ev);
            }
        };

        return img;
    }

    numPalettes() {
        return this.palettes.length;
    }

    getCurrent(): Palette {
        return this.palettes[this.getCurrentId()];
    }

    getCurrentId() {
        if (this.current >= this.palettes.length) {
            this.current = 0;
        }

        return this.current;
    }

    setCurrent(id?: number) {
        if (typeof(id) === 'undefined') {
            id = rand(0, this.palettes.length);
        }

        // Normalize id for wraparound.
        while (id < 0) {
            id += this.palettes.length;
        }
        while (id >= this.palettes.length) {
            id -= this.palettes.length;
        }
        this.current = id;

        localStorage.setItem('palette', `${this.current}`);

        // Update all existing templates
        for (let i = 0; i < this.nextTemplateId; i ++) {
            const { template, destination } = this.templates[`${i}`];
            this.applyPalette(template, destination);
        }

        const palette = this.getCurrent();
        for (let i = 0; i < this.listeners.length; i ++) {
            this.listeners[i](palette);
        }
    }

    getStyle(type: ColorType) {
        const color: Color = this.getCurrent()[type];
        return 'rgba(' + color.join(',') + ')';
    };

    applyPalette(template: HTMLCanvasElement | HTMLImageElement, destination: HTMLCanvasElement) {
        let templateId = destination.getAttribute('palette-dest');
        if (templateId) {
            this.templates[templateId].template = template;
        }
        else {
            templateId = `${this.nextTemplateId++}`;
            this.templates[templateId] = { template, destination };
            destination.setAttribute('palette-dest', templateId);
        }

        destination.width  = template.width ;
        destination.height = template.height;

        const context = destination.getContext('2d');
        if (!context) {
            return;
        }

        // Draw template to canvas
        context.drawImage(template, 0, 0);

        const templateData = context.getImageData(0, 0, destination.width, destination.height).data;

        // Create new pixel data for coloring
        const colored = context.createImageData(destination.width, destination.height);

        const palette = this.getCurrent();
        for (let i = 0; i < colored.data.length; i += 4) {
            if (templateData[i + 3] === 0) continue;

            let pindex = 3;

            // Based on the red value, pick which of the 4 colors this means.
            const rValue = templateData[i];
            if (rValue >= 85) pindex --;
            if (rValue >= 170) pindex --;
            if (rValue >= 255) pindex --;
            const color = palette[pindex];

            colored.data[i+0] = color[0];
            colored.data[i+1] = color[1];
            colored.data[i+2] = color[2];
            colored.data[i+3] = 255;//color[3];
        }

        context.putImageData(colored, 0, 0);
    }
};

const manager = Game.singleton('PaletteManager', PaletteManager);
export { manager as PaletteManager };