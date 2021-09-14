/* -------------------- Animation frames ----------------- */
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        (window as any).webkitRequestAnimationFrame ||
        (window as any).mozRequestAnimationFrame ||
        (window as any).oRequestAnimationFrame ||
        (window as any).msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

import * as Box2D_ from './Box2D.js';
export * as Box2D from './Box2D.js';

/* Passthrough exports */
import { Point } from './juicy.point';
export * from './juicy.point';
export * as Sound from './juicy.sound';

const PIXEL_RATIO = window.devicePixelRatio;

function SetCanvasSize(canvas: HTMLCanvasElement, width: number, height: number) {
    canvas.width = width * PIXEL_RATIO;
    canvas.height = height * PIXEL_RATIO;
    canvas.getContext('2d')?.scale(PIXEL_RATIO, PIXEL_RATIO);
}

interface KeyNameToCodeMap {
    [key: string]: number
};

interface GameSettings {
    canvas: HTMLCanvasElement | string;
    keys: KeyNameToCodeMap;
    width: number;
    height: number;
    scale?: number;
}

class Game {
    private scale = new Point(1);
    mouse = new Point();
    private running: boolean = false;
    private state!: State;
    private lastTime: number = 0;

    private canvas?: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null = null;

    size = new Point();

    private KEYS: KeyNameToCodeMap = {};
    private CODES: { [key: number]: string } = {};

    private keyState: { [key: number]: boolean } = {};
    private listener: { [key: string]: EventListener } = {};

    private debug?: HTMLElement;
    private fps: number = 0;
    private fpsAlpha: number = 0.95;

    init(settings: GameSettings) {
        const {
            canvas,
            keys,
            width,
            height,
            scale,
        } = settings;

        this.size = new Point(width, height);
        this.scale = new Point(scale || 1);
        this.state = new State();

        let canv: HTMLCanvasElement;
        if (canvas instanceof HTMLCanvasElement) {
            canv = canvas;
        }
        else {
            const element = document.getElementById(canvas);
            if (element instanceof HTMLCanvasElement) {
                canv = element;
            }
            else {
                throw Error(`Canvas element with id ${canvas} not found.`);
            }
        }

        this.setCanvas(canv);

        // Input stuff
        this.KEYS = keys || {};
        this.CODES = {};
        for (const key in keys) {
            this.CODES[keys[key]] = key;
        }

        // document hooks
        document.onkeydown = (evt) => {
            this.keyState[evt.keyCode] = true;
        };
        document.onkeyup = (evt) => {
            this.keyState[evt.keyCode] = false;

            this.trigger('keypress', evt);

            const method = 'key_' + this.CODES[evt.keyCode];
            const state = this.state as any;
            if (state && state[method]) {
                state[method](this.CODES[evt.keyCode]);
            }
        };

        return this; // Enable chaining
    }

    clear() {
        for (const action in this.listener) {
            document.removeEventListener(action, this.listener[action]);
        }
        this.listener = {};
    }

    setDebug(debug?: HTMLElement) {
        this.debug = debug;
        return this; // Enable chaining
    }

    setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        
        canvas.style.width = `${this.scale.x * this.size.x}px`;
        canvas.style.height = `${this.scale.y * this.size.y}px`;
        SetCanvasSize(this.canvas, this.size.x, this.size.y);

        let startDrag: MouseEvent | undefined;
        let dragging = false;
        canvas.onmousedown = (evt: MouseEvent) => {
            this.triggerAtPos('mousedown', evt);
            if (!startDrag) {
                startDrag = evt;
            }
        };
        canvas.onmouseup = (evt: MouseEvent) => {
            this.triggerAtPos('mouseup', evt);
            if (!startDrag) {
                return;
            }

            if (!dragging) {
                this.triggerAtPos('click', evt);
            }
            else {
                this.triggerAtPos('dragend', evt);
            }

            startDrag = undefined;
            dragging = false;
        };
        canvas.onmousemove = (evt: MouseEvent) => {
            this.triggerAtPos('mousemove', evt);
            this.mouse = this.getCanvasCoords(evt);

            if (dragging) {
                this.triggerAtPos('drag', evt);
            }
            else if (startDrag) {
                var startPos = this.getCanvasCoords(startDrag);
                var endPos   = this.getCanvasCoords(evt);
                if (startPos.sub(endPos).length() >= 5) {
                    this.triggerAtPos('dragstart', startDrag);
                    dragging = true;
                }
            }
        }

        this.resize();
        return this; // Enable chaining
    }
    
    getCanvasCoords(evt: MouseEvent) {
        if (!this.canvas) {
            throw Error('Game was not properly initialized - canvas is unavailable');
        }

        const canvasRect = this.canvas.getBoundingClientRect();
        const mx = evt.clientX - canvasRect.left;
        const my = evt.clientY - canvasRect.top;

        return new Point(mx, my);
    }

    resize() {
        if (!this.canvas) {
            throw Error('Game was not properly initialized - canvas is unavailable');
        }

        // const parent = this.canvas.parentElement;
        // const width = parent ? parent.clientWidth : this.canvas.clientWidth;
        // const height = parent ? parent.clientHeight : this.canvas.clientHeight;

        // this.canvas.width = width;
        // this.canvas.height = width * this.height / this.width;
        // if (this.canvas.height > height) {
        //     this.canvas.height = height;
        //     this.canvas.width = height * this.width / this.height;
        // }

        // Make sure we re-render
        if (this.state) {
            this.state.hasRendered = false;
        }

        return this; // Enable chaining
    }

    keyDown(key: string | string[]) {
        if (typeof (key) === 'string') {
            return this.keyState[this.KEYS[key]];
        }
        else {
            for (let k = 0; k < key.length; k++) {
                if (this.keyDown(key[k]))
                    return true;
            }

            return false;
        }
    }

    trigger(evt: string, data: any) {
        const state = this.state as any;
        if (state && state[evt]) {
            state[evt](data);
        }
    }

    triggerAtPos(evt: string, pos: MouseEvent) {
        this.trigger(evt, this.getCanvasCoords(pos));
    }

    on(action: string, keys: string | string[], callback?: EventListener) {
        if (action === 'key') {
            if (typeof (keys) !== 'object') {
                keys = [keys];
            }

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];

                (this.state as any)['key_' + key] = callback;
            }
        }
        else {
            callback = keys as any as EventListener;
            if (this.listener[action]) {
                document.removeEventListener(action, this.listener[action]);
            }

            this.listener[action] = callback;
            document.addEventListener(action, this.listener[action]);
        }

        return this; // Enable chaining
    };

    setState(state: State) {
        this.clear();

        this.state = state;
        this.state.game = this;
        this.state.init();
        this.state.hasRendered = false;

        return this; // Enable chaining
    }

    private updateFn = () => this.update();

    update() {
        if (!this.running) {
            return;
        }

        requestAnimationFrame(this.updateFn);
        const nextTime = new Date().getTime();

        if (this.debug && nextTime !== this.lastTime) {
            var fps = 1000 / (nextTime - this.lastTime);
            this.fps = this.fpsAlpha * this.fps + (1 - this.fpsAlpha) * fps;

            this.debug.innerHTML = 'FPS: ' + Math.floor(this.fps);
        }

        const dt = (nextTime - this.lastTime) / 1000;
        if (dt > 0.2) {
            this.lastTime = nextTime;
            return;
        }

        try {
            const updated = !this.state.update(dt) || this.state.updated;
            this.state.updated = false;

            this.lastTime = nextTime;

            if (updated || !this.state.hasRendered) {
                this.render();
                this.state.hasRendered = true;
            }
        }
        catch (e) {
            console.error(e);
            this.pause();
        }
    }

    render() {
        if (!this.context || !this.canvas) {
            this.running = false;
            throw Error('Game was not properly initialized - canvas is unavailable');
        }

        this.context.save();
  
        if (!this.state.stopClear) {
           this.context.clearRect(0, 0, this.size.x, this.size.y);
        }
  
        this.state.render(this.context, this.canvas.width, this.canvas.height);
  
        this.context.restore();

        return this; // Enable chaining
    }

    run() {
        this.running = true;
        this.lastTime = new Date().getTime();

        this.update();

        return this; // Enable chaining
    };

    pause() {
        this.running = false;
    }
}

// Game singleton
let game: Game;
if ((window as any).__juicy__game) {
    game = (window as any).__juicy__game as Game;
}
else {
    game = (window as any).__juicy__game = new Game();
}
export { game as Game };

/* -------------------- Game State_ ----------------------- */
/*
 * new State_() - Construct new state
 *  [Constructor]
 *    init   ()          - Run every time the state is swapped to.
 *  [Useful]
 *    click  (evt)       - When the user clicks the state
 *    update (dt, input) - Run before rendering. Use for logic.
 *                         IMPORTANT: return true if you don't want to re-render
 *    render (context)   - Run after  update.    Use for graphics
 */
export class State {
    /** @internal */
    hasRendered: boolean = false;
    updated: boolean = false;
    stopClear: boolean = false;

    game: Game = game;
    entities: Entity[] = [];

    init() {}

    update(dt: number): boolean | void {
        this.entities.forEach(e => {
            e.update(dt);
        });

        return false;
    }

    render(context: CanvasRenderingContext2D, width: number, height: number) {
        this.entities.forEach(e => {
            e.render(context);
        });
    }

    add(e: Entity) {
        this.entities.push(e);
    }

    get(name: string): Entity | undefined {
        const matches = this.entities.filter(e => e.name === name);
        if (matches.length) {
            return matches[0];
        }
    }

    remove(nameOrEntity: Entity | string) {
        if (typeof(nameOrEntity) === 'string') {
            this.entities = this.entities.filter(e => e.name !== nameOrEntity);
        }
        else {
            this.entities = this.entities.filter(e => e !== nameOrEntity);
        }
    }

    mousedown(pos: Point) {
        this.entities.forEach(e => {
            if (e.contains(pos)) {
                e.active = true;
                e.mousedown(pos);
            }
        });
    }

    mouseup(pos: Point) {
        this.entities.forEach(e => {
            if (e.contains(pos)) {
                e.mouseup(pos);
            }
            e.active = false;
        });
    }
};

/* -------------------- Game Entity ----------------------- */
/*
 * new Entity(components) - Construct new entity
 *  [Static Properties]
 *    components       - Array of component constructors
 *  [Constructor]
 *    addComponent (c[, name]) - Add a component to the entity
 *  [Useful]
 *    get (c) - Get an (updated) component.
 *    update (dt, c)   - Calls update on all components, or just c
 *    render (context) - Calls render on all components
 */
export type RenderArgs = [CanvasRenderingContext2D, number, number, number, number];

export class Entity {
    state: State;

    props: { [key: string]: any } = {};
    visible: boolean = true;
    name?: string;

    position: Point = new Point();
    scale: Point = new Point(1);
    width: number = 0;
    height: number = 0;
    active: boolean = false;

    components: Component[] = [];
    updated: boolean[] = [];

    parent?: Entity;
    children: Entity[] = [];

    constructor(state: State, name?: string, components?: (Component | (new () => Component))[]) {
        if (typeof(name) !== 'string') {
            components = name;
            name = undefined;
        }

        this.name = name;
        this.state = state;
        
        components = (components || []).concat(this.initialComponents());
        components.forEach(c => this.addComponent(c));
        state.add(this);

        this.init();
    }

    init() {}

    initialComponents(): (new () => Component)[] {
        return [];
    }

    globalPosition(): Point {
        const position = this.position.copy();
        if (this.parent) {
            return position.mult(this.parent.globalScale()).add(this.parent.globalPosition());
        }
        return position;
    }

    globalScale(): Point {
        const scale = this.scale.copy();
        if (this.parent) {
            return scale.mult(this.parent.globalScale());
        }
        return scale;
    }

    contains(point: Point) {
        point = point.copy().sub(this.globalPosition());
        return point.x >= 0 &&
               point.y >= 0 &&
               point.x <= this.width &&
               point.y <= this.height;
    }

    distance(other: Entity | Point) {
        if (other instanceof Entity) {
            other = other.globalPosition();
        }

        return this.globalPosition().sub(other).length();
    }

    collidesWith(other: Entity) {
        // TODO account for parent entities
        const otherBottomRight = other.position.add(new Point(other.width, other.height));
        const bottomRight      = this .position.add(new Point(this .width, this .height));
  
        return otherBottomRight.x >= this.position.x &&
               otherBottomRight.y >= this.position.y &&
               other.position.x   <= bottomRight.x   &&
               other.position.y   <= bottomRight.y;
    }

    addComponent(c: Component | (new () => Component)) {
        if (typeof (c) === 'function') {
            c = new c();
            c.init(this);
        }

        if (c.entity) {
            c.entity.remove(c);
        }

        c.entity = this;
        this.components.push(c);
        this.updated.push(false);
        return c;
    }

    add<C extends Component>(constructor: (new () => C)): C {
        return this.addComponent(constructor) as C;
    }

    remove(component: Component) {
        this.components = this.components.filter(c => c !== component);
    }

    get<C extends Component>(constructor: (new () => C)): C | undefined {
        for (let i = 0; i < this.components.length; i++) {
            if ((this.components[i] as any).__proto__.constructor.name === constructor.name) {
                return this.components[i] as C;
            }
        }
    }

    addChild(child: Entity) {
        child.parent = this;
        this.children.push(child);
    }

    mousedown(pos: Point) {
        this.components.forEach(c => c.mousedown(pos));
    }

    mouseup(pos: Point) {
        this.components.forEach(c => c.mouseup(pos));
    }

    update<C extends Component>(dt: number, constructor?: (new () => C)) {
        if (constructor) {
            for (let i = 0; i < this.components.length; i++) {
                if ((this.components[i] as any).__proto__.name === constructor.name) {
                    if (!this.updated[i]) {
                        this.components[i].update(dt, this.state.game);
                        this.updated[i] = true;
                    }
                    break;
                }
            }
        }
        else {
            this.updated.fill(false);
            for (let i = 0; i < this.components.length; i++) {
                if (!this.updated[i]) {
                    this.components[i].update(dt, this.state.game);
                    this.updated[i] = true;
                }
            }
        }
    }

    render(context: CanvasRenderingContext2D) {
        context.save();
        context.translate(this.position.x, this.position.y);
        context.scale(this.scale.x, this.scale.y);

        let renderArgs: RenderArgs;
        if (arguments.length === 1) {
            renderArgs = [context, 0, 0, this.width, this.height];
        }
        else if (arguments.length === 3) {
            renderArgs = Array.prototype.slice.call(arguments) as RenderArgs;
            renderArgs.push(this.width, this.height);
        }
        else if (arguments.length === 5) {
            renderArgs = Array.prototype.slice.call(arguments) as RenderArgs;
        }
        else {
            throw Error(`${arguments.length} arguments passed to Entity.render, when only 1 or 5 are supported`);
        }

        this.components.forEach(c => c.render.apply(c, renderArgs));
        this.children.forEach(child => child.render(context));
        context.restore();
    }
}

/* -------------------- Game Component -------------------- */
/*
 * new Component(entity) - Construct new component on an entity
 *  [Static Properties]
 *    name             - Name of the component
 *  [Useful]
 *    update (dt)      - Update component (if applicable)
 *    render (context) - Render component (if applicable)
 *
 * Component.create(name, prototype, static[, force])
 *    - Extend and register by name. Force to override another component
 */
export class Component {
    entity!: Entity;

    init(e: Entity) { }
    mousedown(pos: Point) {}
    mouseup(pos: Point) {}
    update(dt: number, game: Game) { }
    render(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) { }
}

export type Color = string | CanvasGradient | CanvasPattern;

/* -------------------- Typical Components --------------- */
export class ImageComponent extends Component {
    private tint?: Color;
    opacity: number = 1;
    image: HTMLImageElement = new Image();

    width?: number;
    height?: number;

    onload?: ((img: ImageComponent) => void);
    canvas?: HTMLCanvasElement;

    init(entity: Entity) {
        this.opacity = 1;

        this.image.onload = () => {
            if (!entity.width && !entity.height) {
                entity.width = this.image.width;
                entity.height = this.image.height;
            }

            if (this.tint) {
                this.setTint(this.tint);
            }

            if (this.onload) {
                this.onload(this);
            }

            entity.state.updated = true;
        }
        this.image.onerror = () => {
            this.image = new Image();
        }
    }

    setTint(tint: Color) {
        // TODO glean alpha of tint
        this.tint = tint;

        if (this.image.complete) {
            // Apply tint
            this.canvas = this.canvas || document.createElement('canvas');
            SetCanvasSize(this.canvas, this.image.width, this.image.height);

            const context = this.canvas.getContext('2d');
            if (!context) {
                throw Error('Failed getting image context');
            }

            context.fillStyle = this.tint;
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // destination atop makes a result with an alpha channel identical to fg,
            // but with all pixels retaining their original color *as far as I can tell*
            context.globalCompositeOperation = "destination-atop";
            context.globalAlpha = 0.75;
            context.drawImage(this.image, 0, 0);
            context.globalAlpha = 1;
        }

        return this; // Enable chaining
    }

    setImage(url: string) {
        this.image.src = url;

        return this; // Enable chaining
    }

    render(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        const originalAlpha = context.globalAlpha;

        context.globalAlpha = this.opacity;
        context.drawImage(this.image, x, y, w, h);

        if (this.tint && this.canvas) {
            context.drawImage(this.canvas, x, y, w, h);
        }

        // Restore original global alpha
        context.globalAlpha = originalAlpha;
    }
}

export class BoxComponent extends Component {
    fillStyle: Color = 'white';

    setFillStyle(style: Color) {
        this.fillStyle = style;
    }

    render(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        context.fillStyle = this.fillStyle;
        context.fillRect(x, y, w, h);
    }
}

export interface TextInfo {
    font: string;
    size: number;
    text: string;
    fillStyle: Color;
    padding: Point;
}

export class TextComponent extends Component {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    textInfo: TextInfo = {
        font: 'Arial',
        size: 32,
        text: '',
        fillStyle: 'white',
        padding: new Point()
    };
    opacity: number = 1;
    ready: boolean = false;

    constructor() {
        super();

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    set(config: Partial<TextInfo>): Promise<void> {
        const entity = this.entity;
        if (!entity) {
            throw Error('Setting text info before an entity is assign');
        }

        // Set attributes
        Object.assign(this.textInfo, config);

        const font = this.getFont();
        const fonts = (document as any).fonts;
        if (fonts && !fonts.check(font)) {
            return fonts.load(font).then(() => {
                this.renderOffscreen();
                this.ready = true;
            });
        }
        else {
            this.renderOffscreen();
            this.ready = true;
            return Promise.resolve();
        }
    }

    getFont() {
        return `${this.textInfo.size}px ${this.textInfo.font}`;
    }

    measure() {
        this.context.font = this.getFont();
        const size = this.context.measureText(this.textInfo.text);
        return new Point(Math.ceil(size.width), Math.ceil(this.textInfo.size + 2));
    }

    renderOffscreen() {
        // Measure the text size
        const entity = this.entity;
        const context = this.context;
        const canvas = this.canvas;
        const size = this.measure();
        const { fillStyle, text, padding } = this.textInfo;

        // Resize canvas
        entity.width = size.x + padding.x * 2;
        entity.height = size.y + padding.y * 2;
        SetCanvasSize(canvas, entity.width, entity.height);

        // Draw text
        context.textBaseline = 'top';
        context.font = this.getFont();
        context.fillStyle = fillStyle;
        context.fillText(text, padding.x, padding.y);
    }

    render(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        // Save original alpha
        const originalAlpha = context.globalAlpha;
        context.globalAlpha = this.opacity;

        arguments[0] = this.canvas;
        context.drawImage(this.canvas, x, y, w, h);

        context.globalAlpha = originalAlpha;
    }
};

export type Behavior = (dt: number, game: Game) => void;
export class BehaviorComponent extends Component {
    callback: Behavior;

    constructor(callback: Behavior) {
        super();

        this.callback = callback;
    }

    update(dt: number, game: Game) {
        this.callback(dt, game);
    }
}

/* -------------------- Helper functions ----------------- */
/*
 * Juicy.rand([min, ] max) - Return a random int between [min, max)
 */
export function rand(min: number, max: number) {
    if (max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    else {
        return Math.floor(Math.random() * min);
    }
};
