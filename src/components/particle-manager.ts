import { Component, Game, Point } from "../../lib/juicy";
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

export class ParticleManagerComponent extends Component {
    private particles: Particle[] = [];

    update(dt: number, game: typeof Game) {
        this.particles = this.particles.filter((p) => {
            return p.update(p, dt) ?? true;
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
