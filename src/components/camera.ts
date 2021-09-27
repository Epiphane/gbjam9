import { Component, Entity, Game, Point } from '../../lib/juicy';
import { PhysicsBody } from './physics';
import { PlayerPhysics } from './player-physics';

export interface CameraBounds {
    min: Point;
    max: Point;
}

export class Camera extends Component {
    target?: Entity;
    easing = 0;
    maxEasing = 0;
    shakeTime = 0;

    bounds: CameraBounds = {
        min: new Point(),
        max: new Point(),
    };

    constructor() {
        super();

        this.setDefaultEasing();
    }

    follow(target: Entity) {
        this.target = target;
        return this; // enable chaining
    }

    shake(time: number) {
        this.shakeTime = time;
    }

    setDefaultEasing() {
        this.easing = 100;
        this.maxEasing = 300;
    }

    setBounds(bounds: CameraBounds) {
        this.bounds = bounds;
        return this; // enable chaining
    }

    // Set the easing weight. 1 is instant snap, 0 never moves.
    setEasing(weight: number) {
        this.easing = weight;
        return this; // enable chaining
    }

    getTargetPosition(): Point {
        if (!this.target) {
            return this.entity.position.copy();
        }

        const pos = new Point(
            this.target.position.x + this.target.width / 2 - Game.size.x / 2,
            this.target.position.y - (Game.size.y - 59)
        );
        pos.x = Math.max(Math.min(pos.x, this.bounds.max.x - Game.size.x), this.bounds.min.x);
        pos.y = Math.max(Math.min(pos.y, this.bounds.max.y - Game.size.y), this.bounds.min.y);
        return pos;
    }

    snapCamera() {
        this.entity.position = this.getTargetPosition();
    }

    update(dt: number) {
        if (!this.target) {
            return;
        }

        // There's probably some cool camera work to do here but WHATEVER

        const { x, y } = this.getTargetPosition();

        if (this.shakeTime > 0) {
            this.shakeTime = Math.max(this.shakeTime - dt, 0);
        }

        const dx = x - this.entity.position.x + 3 * Math.sin(this.shakeTime * 75);
        const dy = y - this.entity.position.y;// + Math.sin(this.shakeTime);

        let easeX = this.easing;
        let easeY = this.easing;

        if (Math.abs(dx) > 10) {
            easeX = this.easing + (this.maxEasing - this.easing) * Math.min(1, (Math.abs(dx) - 10) / 10);
        }

        if (dy < -20 || dy > 10) {
            let lerped = 0;
            if (dy < 0) {
                lerped = (-20 - dy) / 10;
            }
            else {
                lerped = (dy - 10) / 5;
            }
            easeY = this.easing + (this.maxEasing - this.easing) * Math.min(1, lerped);
        }

        let moveX = Math.sign(dx) * Math.min(easeX * dt, Math.abs(dx));
        let moveY = Math.sign(dy) * Math.min(easeY * dt, Math.abs(dy));

        this.entity.position.add(moveX, moveY);
    }
}