import { Component, Point, Game, Entity } from '../../lib/juicy';
import { CoolText } from './cool-text';

export interface Animation {
    name: string;
    sheet: number[];
    frameTime: number;
    repeat?: boolean;
};

export class SpriteComponent extends Component {
    image: HTMLCanvasElement = document.createElement('canvas');

    sheetWidth = 1;
    sheetHeight = 1;
    spriteWidth = 0;
    spriteHeight = 0;

    frameTime = -1; // Don't animate yet
    timeLeft = 0;
    repeat = false;
    flip = false;
    opacity = 1;

    current: string = '';
    sheet: number[] = [0];
    sprite: number = 0;

    onload?: ((img: SpriteComponent) => void);
    canvas?: HTMLCanvasElement;

    oncompleteanimation?: (() => any);

    protected onImageLoad = (img: HTMLImageElement) => {
        this.image.width = img.width;
        this.image.height = img.height;
        this.image.getContext('2d')?.drawImage(img, 0, 0);

        this.sheetWidth = this.image.width / this.spriteWidth;
        this.sheetHeight = this.image.height / this.spriteHeight;

        if (this.entity) {
            this.entity.state.updated = true;
        }

        if (this.onload) {
            this.onload(this);
        }
    }

    setImage(url: string) {
        const image = new Image();
        image.src = url;
        image.onload = this.onImageLoad.bind(this, image);

        return this; // Enable chaining
    }

    setSize(spriteWidth: number, spriteHeight: number) {
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.entity.width = spriteWidth;
        this.entity.height = spriteHeight;

        this.frameTime = -1; // Don't animate yet
        this.repeat = false;
        this.sprite = 0;
        this.sheet = [0];

        return this; // Enable chaining
    }

    setFlip(flip: boolean) {
        this.flip = flip;
        return this; // Enable 2chainz
    }

    runAnimation({ name, sheet, frameTime, repeat }: Animation) {
        this.frameTime = frameTime;
        if (this.current !== name) {
            this.current = name;
            this.timeLeft = frameTime;
            this.sprite = 0;
        }

        this.sheet = sheet;
        this.repeat = !!repeat;

        return this; // Enable chaining
    }

    animating() {
        return (this.frameTime >= 0 && (this.repeat || this.sprite < this.sheet.length));
    }

    goNextFrame() {
        this.sprite++;

        this.timeLeft = this.frameTime;

        if (this.sprite >= this.sheet.length) {
            if (this.repeat) {
                this.sprite = 0;
            }
            else {
                this.sprite = this.sheet.length;
                this.frameTime = -1;
                if (this.oncompleteanimation) {
                    this.oncompleteanimation();
                }
            }
        }
    }

    update(dt: number) {
        if (this.animating()) {
            this.timeLeft -= dt;

            if (this.timeLeft <= 0) {
                this.goNextFrame();
            }
        }
    }

    render(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        context.imageSmoothingEnabled = false;

        context.save();
        const index = this.sheet[this.sprite]!;
        var sx = (index % this.sheetWidth) * this.spriteWidth;
        var sy = Math.floor(index / this.sheetWidth) * this.spriteHeight;

        if (this.flip) {
            context.translate(this.spriteWidth, 0);
            context.scale(-1, 1);
        }
        if (this.opacity === 1) {
            context.drawImage(this.image, sx, sy, this.spriteWidth, this.spriteHeight, x, y, w, h);
        }
        else {
            const canvasData = context.getImageData(this.entity.position.x, this.entity.position.y, this.spriteWidth, this.spriteHeight).data
            const imageData = this.image.getContext('2d')!.getImageData(sx, sy, this.spriteWidth, this.spriteHeight).data
            const colored = this.image.getContext('2d')!.createImageData(w, h);
            for (let i = 0; i < colored.data.length; i += 4) {
                if (imageData[i + 3] === 0) continue;

                let hash = ((i + 123816749814 + Math.sin(i) * 10021416854) * 232134210958);
                hash = hash % 213978625;
                hash = (hash % 100) / 100;

                if (this.opacity > hash) {
                    colored.data[i+0] = imageData[i+0];
                    colored.data[i+1] = imageData[i+1];
                    colored.data[i+2] = imageData[i+2];
                    colored.data[i+3] = 255;
                }
                else {
                    colored.data[i+0] = canvasData[i+0];
                    colored.data[i+1] = canvasData[i+1];
                    colored.data[i+2] = canvasData[i+2];
                    colored.data[i+3] = 255;
                }
            }

            context.putImageData(colored, this.entity.position.x, this.entity.position.y);
        }
        context.restore();
    }
};
