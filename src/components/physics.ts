import { Component, Point } from "../../lib/juicy";
import { MapComponent } from "./map";
import { Hitbox } from "./stupid-hitbox";

export class PhysicsBody extends Component {
    active = true;
    velocity = new Point();

    update(dt: number) {
        if (!this.active) {
            return;
        }

        const map = this.entity.state.get('map')?.get(MapComponent);
        if (!map) {
            console.error(`Can't simulate physics without a map entity. Add this to your scene: new Entity(this, 'map', [MapComponent]);`);
            this.active = false;
            return;
        }

        const hitbox = this.entity.get(Hitbox);
        if (!hitbox) {
            console.error(`Can't simulate physics without a hitbox. Add the Hitbox component to your entity`);
            this.active = false;
            return;
        }

        const { min, max } = hitbox.getBounds();
        const { x: dx, y: dy } = this.velocity;

        const steps = 8;
        const moveX = dx * dt / steps;
        const moveY = dy * dt / steps;

        for (let i = 0; i < steps; i++) {
            this.entity.position.x += moveX;
            this.entity.position.y += moveY;
        }
    }
};