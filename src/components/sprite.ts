import { Component, Point, Game, Entity } from '../../lib/juicy';

export interface Animation {
    name: string;
    sheet: number[];
    frameTime: number;
    repeat?: boolean;
};

export class SpriteComponent extends Component {
    image: HTMLImageElement | HTMLCanvasElement = new Image();
    width?: number;
    height?: number;

    sheetWidth   = 0;
    sheetHeight  = 0;
    spriteWidth  = 0;
    spriteHeight = 0;

    frameTime = -1; // Don't animate yet
    timeLeft = 0;
    repeat = false;
    flip = false;

    current: string = '';
    sheet: number[] = [];
    sprite: number = 0;

    onload?: ((img: SpriteComponent) => void);
    canvas?: HTMLCanvasElement;

    oncompleteanimation?: (() => any);

    init() {
        this.image.onload = this.onImageLoad;
    }

    protected onImageLoad = () => {
        this.sheetWidth   = this.image.width / this.spriteWidth;
        this.sheetHeight  = this.image.height / this.spriteHeight;

        if (this.entity) {
            this.entity.state.updated = true;
        }

        if (this.onload) {
            this.onload(this);
        }
    }

    setImage(url: string) {
        if (this.image instanceof HTMLImageElement) {
            this.image.src = url;
        }
        else {
            throw 'SpriteComponent image is not an instance of an HTMLImageElement';
        }

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
        this.sheet = [];

        return this; // Enable chaining
    }

    setFlip(flip: boolean) {
        this.flip = flip;
    }

    runAnimation({ name, sheet, frameTime, repeat }: Animation) {
        if (this.current === name) {
            return this; // enable chaining
        }

        this.current = name;
        this.frameTime = frameTime;
        this.timeLeft = frameTime;
        this.sheet = sheet;
        this.repeat = !!repeat;
        this.sprite = 0;

        return this; // Enable chaining
    }

    animating() {
        return (this.frameTime >= 0 && (this.repeat || this.sprite < this.sheet.length));
    }

    goNextFrame() {
        this.sprite ++;

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
        const index = this.sheet[this.sprite];
        var sx = (index % this.sheetWidth) * this.spriteWidth;
        var sy = Math.floor(index / this.sheetWidth) * this.spriteHeight;

        if (this.flip) {
            context.translate(this.spriteWidth, 0);
            context.scale(-1, 1);
        }
        context.drawImage(this.image, sx, sy, this.spriteWidth, this.spriteHeight, x, y, w, h);
        context.restore();
    }
};
