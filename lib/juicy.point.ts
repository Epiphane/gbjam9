import { PlayerAnimationEvent } from "../src/components/player-animation";

export class Point {
    x: number;
    y: number;

    constructor(x: number = 0, y?: number) {
        this.x = x;
        this.y = (typeof(y) === 'number') ? y : x;
    }

    isEqual(other: Point) {
        return this.x === other.x && this.y === other.y;
    }

    copy() {
        return new Point(this.x, this.y);
    }

    add(x: Point | number, y?: number) {
        if (typeof(x) === 'number') {
            this.x += x;
            this.y += typeof(y) === 'number' ? y : x;
        }
        else {
            this.x += x.x;
            this.y += x.y;
        }
        return this;
    }

    mult(x: Point | number, y?: number) {
        if (typeof(x) === 'number') {
            this.x *= x;
            this.y *= typeof(y) === 'number' ? y : x;
        }
        else {
            this.x *= x.x;
            this.y *= x.y;
        }
        return this;
    }

    multScalar(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    sub(other: Point) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}
