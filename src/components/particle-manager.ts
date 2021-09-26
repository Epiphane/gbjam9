import { Component, FillStyle, Game, Point } from "../../lib/juicy";
import { ColorFromType, ColorType } from "../helpers/palette";

// Return FALSE to kill this particle
type ParticleUpdateFunction = (thisParticle: Particle, dt: number) => boolean | void;

export abstract class Particle {
    lifespan: number;
    update: ParticleUpdateFunction;
    origin: Point;
    velocity: Point;

    protected constructor(lifespan: number, update: ParticleUpdateFunction, origin: Point, velocity: Point = new Point(0, 0)) {
        this.lifespan = lifespan;
        this.update = update;
        this.origin = origin;
        this.velocity = velocity;
    }

    abstract render(ctx: CanvasRenderingContext2D): void
}

interface Renderable {
    render: (ctx: CanvasRenderingContext2D, particle: Particle) => void;
}

export class CircleParticle extends Particle {
    radius: number;
    color: ColorType;

    constructor(lifespan: number, update: ParticleUpdateFunction, origin: Point, velocity: Point = new Point(0, 0), radius: number, color: ColorType) {
        super(lifespan, update, origin, velocity);
        this.radius = radius;
        this.color = color;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = ColorFromType(this.color);
        ctx.fillRect(Math.round(this.origin.x), Math.round(this.origin.y), 1, 1);
    }
}

export class PixelParticle extends Particle {
    value: number;

    constructor(lifespan: number, update: ParticleUpdateFunction, origin: Point, velocity: Point = new Point(0, 0), value: number) {
        super(lifespan, update, origin, velocity);
        this.value = value;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgb(${this.value}, ${this.value}, ${this.value})`;
        ctx.fillRect(Math.round(this.origin.x), Math.round(this.origin.y), 1, 1);
    }
}

export class ParticleManagerComponent extends Component {
    private particles: Particle[] = [];

    update(dt: number, game: typeof Game) {
        this.particles = this.particles.filter((p) => {
            p.lifespan -= dt;
            const alive = p.update(p, dt) ?? true;
            return alive && p.lifespan > 0;
        });
    }

    render(ctx: CanvasRenderingContext2D) {
        this.particles.forEach((p) => {
            p.render(ctx);
        });
    }

    addParticle(particle: Particle) {
        this.particles.push(particle);
    }
}
