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

    add(other: Point) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    mult(other: Point) {
        this.x *= other.x;
        this.y *= other.y;
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
