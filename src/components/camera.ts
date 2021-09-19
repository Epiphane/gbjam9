import { Component, Entity, Game, Point } from '../../lib/juicy';

export interface CameraBounds {
    min: Point;
    max: Point;
}

export class Camera extends Component {
    target?: Entity;
    bounds: CameraBounds = {
        min: new Point(),
        max: new Point(),
    };

    follow(target: Entity) {
        this.target = target;
    }

    setBounds(bounds: CameraBounds) {
        this.bounds = bounds;
    }

    update(dt: number) {
        if (!this.target) {
            return;
        }

        // this.entity.position = this.target.position.copy();
        this.entity.position.x = this.target.position.x - Game.size.x / 2;
        this.entity.position.y = this.target.position.y - (Game.size.y - 60);

        this.entity.position.x = Math.max(Math.min(this.entity.position.x, this.bounds.max.x - Game.size.x), this.bounds.min.x);
        this.entity.position.y = Math.max(Math.min(this.entity.position.y, this.bounds.max.y - Game.size.y), this.bounds.min.y);
    }
}