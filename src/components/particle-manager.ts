import { Component, Game, Point } from "../../lib/juicy"
import { ColorFromType, ColorType } from "../helpers/palette"

// Return TRUE to kill this particle
type ParticleUpdateFunction = (thisParticle: Particle, dt: number) => boolean;

export abstract class Particle {
  lifespan: number;
  update: ParticleUpdateFunction;
  origin: Point

  protected constructor(lifespan: number, update: ParticleUpdateFunction, origin: Point) {
    this.lifespan = lifespan;
    this.update = update;
    this.origin = origin;
  }

  abstract render(ctx: CanvasRenderingContext2D): void
}

interface Renderable {
  render: (ctx: CanvasRenderingContext2D, particle: Particle) => void;
}

export class CircleParticle extends Particle {
  radius: number;
  color: ColorType;

  constructor(lifespan: number, update: ParticleUpdateFunction, origin: Point, radius: number, color: ColorType) {
    super(lifespan, update, origin);
    this.radius = radius;
    this.color = color;
  }

  render(ctx: CanvasRenderingContext2D) {
      ctx.fillRect(Math.round(this.origin.x), Math.round(this.origin.y), 1, 1)
  }
}

export class ParticleManagerComponent extends Component {
  private particles: Particle[] = [];

  update(dt: number, game: typeof Game) {
    this.particles = this.particles.filter((p) => {
      return p.update(p, dt);
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
