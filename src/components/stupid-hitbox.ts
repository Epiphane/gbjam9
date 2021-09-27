// FUN FACT: This was supposed to be named hitbox.ts but my AdBlock
// extension blocks the name `hitbox.js`, so we're naming it something else.
//
// Thank you, uBlock

import { Point, Component } from "../../lib/juicy";
import { __HITBOXES__ } from "../helpers/debug";

interface BoundingBox {
    position: Point;
    size: Point;
}

export class Hitbox extends Component {
    private offset = new Point(0);
    private size?: Point;
    private visible = __HITBOXES__;

    private colliding: Hitbox[] = [];
    onCollide?: (other: Hitbox) => void;

    getSize() {
        return this.size || new Point(this.entity.width, this.entity.height);
    }

    getOffset() {
        return this.offset;
    }

    setOffset(x: number, y: number) {
        this.offset = new Point(x, y);
        return this; // enable chaining
    }

    setSize(width: number, height: number) {
        this.size = new Point(width, height);
        return this; // enable chaining
    }

    setVisible(visible: boolean) {
        this.visible = visible;
        return this; // enable chaining
    }

    getBounds() {
        const size = this.getSize();
        const min = this.entity.position.copy().add(this.offset);
        const max = min.copy().add(size).sub(new Point(1));
        return { min, max, size };
    }

    test(other: Hitbox | BoundingBox) {
        const { min, max } = this.getBounds();
        let otherMin, otherMax: Point;
        if (other instanceof Hitbox) {
            const bounds = other.getBounds();
            otherMin = bounds.min;
            otherMax = bounds.max;
        }
        else {
            otherMin = other.position;
            otherMax = other.position.copy().add(other.size);
        }

        if (min.x > otherMax.x ||
            min.y > otherMax.y ||
            max.x < otherMin.x ||
            max.y < otherMin.y
        ) {
            return false;
        }

        return true;
    }

    update(dt: number) {
        if (this.onCollide) {
            this.entity.state.entities.forEach(e => {
                const hitbox = e.get(Hitbox);
                if (!hitbox) {
                    return;
                }

                if (hitbox === this) {
                    return;
                }

                const collideNdx = this.colliding.indexOf(hitbox);
                const wasColliding = collideNdx >= 0;
                const colliding = this.test(hitbox);
                if (colliding && !wasColliding) {
                    this.onCollide!(hitbox);
                    this.colliding.push(hitbox);
                }
                else if (!colliding && wasColliding) {
                    this.colliding.splice(collideNdx, 1);
                }
            });
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.visible) {
            const { size } = this.getBounds();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.offset.x + 0.5, this.offset.y + 0.5, size.x - 1, size.y - 1);
        }
    }
}