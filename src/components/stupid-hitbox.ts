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

    getOffset() {
        return this.offset;
    }

    setOffset(x: number, y: number) {
        this.offset = new Point(x, y);
    }

    setSize(width: number, height: number) {
        this.size = new Point(width, height);
    }

    setVisible(visible: boolean) {
        this.visible = visible;
    }

    getBounds() {
        const size = this.size ? this.size : new Point(this.entity.width, this.entity.height)
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

    render(ctx: CanvasRenderingContext2D) {
        if (this.visible) {
            const { size } = this.getBounds();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.offset.x + 0.5, this.offset.y + 0.5, size.x - 1, size.y - 1);
        }
    }
}