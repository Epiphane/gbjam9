import { Component, Entity, Game, Point } from '../../lib/juicy';
import { PhysicsBody } from './physics';
import { PlayerPhysics } from './player-physics';

export interface CameraBounds {
    min: Point;
    max: Point;
}

export class Camera extends Component {
    target?: Entity;
    targetX = 0;
    targetY = 0;
    targetIsFalling = false;
    easing = 0.3;

    bounds: CameraBounds = {
        min: new Point(),
        max: new Point(),
    };

    follow(target: Entity) {
        this.target = target;
        return this; // enable chaining
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

    update(dt: number) {
        if (!this.target) {
            return;
        }

        // There's probably some cool camera work to do here but WHATEVER

        this.targetX = this.target.position.x - Game.size.x / 2;
        this.targetY = this.target.position.y - (Game.size.y - 60);

        this.entity.position.x = this.targetX;
        this.entity.position.y = this.targetY;
        this.entity.position.x = Math.max(Math.min(this.entity.position.x, this.bounds.max.x - Game.size.x), this.bounds.min.x);
        this.entity.position.y = Math.max(Math.min(this.entity.position.y, this.bounds.max.y - Game.size.y), this.bounds.min.y);
    }
}