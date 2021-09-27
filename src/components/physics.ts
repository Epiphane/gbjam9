import { Component, Game, Point, Sound } from "../../lib/juicy";
import { TileInfo } from "../helpers/tiles";
import { MapComponent } from "./map";
import { Hitbox } from "./stupid-hitbox";
import { getMapFromComponent } from '../helpers/quick-get';
import { Direction, Obstacle } from "./obstacle";

export class PhysicsBody extends Component {
    velocity = new Point();
    terminalVelocity = 200;
    hover = false;

    // Each flag is whether or not you can move in the specified direction.
    // blocked[1][1] is unused, as it's the player's current location.
    protected blocked = [
        [false, false, false],
        [false, false, false],
        [false, false, false],
    ];

    isValidMove(dx: number, dy: number, map: MapComponent, hitbox: Hitbox) {
        this.entity.position.x += dx;
        this.entity.position.y += dy;
        const result = this.isValidPosition(map, hitbox, dx, dy);
        this.entity.position.x -= dx;
        this.entity.position.y -= dy;
        return result;
    }

    isValidPosition(map: MapComponent, hitbox: Hitbox, dx: number, dy: number) {
        // Test map collision
        const { min, max } = hitbox.getBounds();
        const tileMin = map.getTileCoords(min);
        const tileMax = map.getTileCoords(max);

        // Check every tile we overlap with.
        for (let tx = tileMin.x; tx <= tileMax.x; tx++) {
            for (let ty = tileMin.y; ty <= tileMax.y; ty++) {
                const tile = map.getTile(tx, ty);

                if (!TileInfo[tile].walkable) {
                    return false;
                }
            }
        }

        const box = {
            position: min,
            size: max.copy().sub(min),
        };

        for (let i = 0; i < this.entity.state.entities.length; ++i) {
            const e = this.entity.state.entities[i];
            const obstacle = e!.get(Obstacle);
            const obstacleHitbox = e!.get(Hitbox);
            if (obstacle?.isActive() && obstacleHitbox?.isActive()) {
                if (!obstacleHitbox.test(box)) {
                    continue;
                }

                // You have to be entering the obstacle
                if (dx > 0 && !obstacle.canPass(Direction.Right)) {
                    box.position.x -= dx * 1.2;
                    if (!obstacleHitbox.test(box)) {
                        return false;
                    }
                    box.position.x += dx * 1.2;
                }

                if (dx < 0 && !obstacle.canPass(Direction.Left)) {
                    box.position.x -= dx * 1.2;
                    if (!obstacleHitbox.test(box)) {
                        return false;
                    }
                    box.position.x += dx * 1.2;
                }

                if (dy > 0 && !obstacle.canPass(Direction.Down)) {
                    box.position.y -= dy * 1.2;
                    if (!obstacleHitbox.test(box)) {
                        return false;
                    }
                    box.position.y += dy * 1.2;
                }

                if (dy < 0 && !obstacle.canPass(Direction.Up)) {
                    box.position.y -= dy * 1.2;
                    if (!obstacleHitbox.test(box)) {
                        return false;
                    }
                    box.position.y += dy * 1.2;
                }
            }
        }

        return true;
    }

    isBouncyTime(hitbox: Hitbox) {
        // Test map collision
        const { min, max } = hitbox.getBounds();
        const box = {
            position: new Point(min.x, min.y + 1),
            size: max.copy().sub(min),
        };

        for (let i = 0; i < this.entity.state.entities.length; ++i) {
            const e = this.entity.state.entities[i];
            const obstacle = e!.get(Obstacle);
            const obstacleHitbox = e!.get(Hitbox);
            if (obstacle?.isActive() && obstacleHitbox?.isActive()) {
                if (!obstacleHitbox.test(box) || !obstacle.isAFunnyBouncyBoy) {
                    continue;
                }

                if (!obstacle.canPass(Direction.Down)) {
                    if (obstacleHitbox.test(box)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    computeBlockages(map: MapComponent, hitbox: Hitbox) {
        for (let i = 0; i <= 2; i++) {
            for (let j = 0; j <= 2; j++) {
                if (i === 1 && j === 1) continue;

                this.blocked[j]![i] = !this.isValidMove(i - 1, j - 1, map, hitbox);
            }
        }
    }

    isBlocked(dx: number, dy: number) {
        if (dx >= -1 && dx <= 1 && dy >= -1 && dy <= 1) {
            return this.blocked[dy + 1]![dx + 1];
        }
        else {
            return !this.isValidMove(dx, dy, getMapFromComponent(this)!, this.entity.get(Hitbox)!);
        }
    }

    update(dt: number, game: typeof Game) {
        const map = getMapFromComponent(this)
        if (!map) {
            console.error(`Can't simulate physics without a map entity. Add this to your scene: new Entity(this, 'map', [MapComponent]);`);
            this.setActive(false);
            return;
        }

        const hitbox = this.entity.get(Hitbox);
        if (!hitbox) {
            console.error(`Can't simulate physics without a hitbox. Add the Hitbox component to your entity`);
            this.setActive(false);
            return;
        }

        this.computeBlockages(map, hitbox);
        if (!this.blocked[2]![1] && !this.hover) {
            this.velocity.y += dt * 800;

            this.velocity.y = Math.min(this.terminalVelocity, this.velocity.y);
        }
        else if (this.isBouncyTime(hitbox)) {
            // Funny funny bouncy time
            this.velocity.y = -2 * this.terminalVelocity;
            Sound.Load('Bounce',
                {
                    src: './audio/bounce.wav',
                    isSFX: true,
                    volume: 0.2
                });
            Sound.Play('Bounce');
        }

        const { x: dx, y: dy } = this.velocity;
        if (dx === 0 && dy === 0) {
            return;
        }

        const steps = 100;
        let moveX = dx * dt / steps;
        let moveY = dy * dt / steps;
        let moveDirX = Math.sign(moveX) + 1;
        let moveDirY = Math.sign(moveY) + 1;

        for (let i = 0; i < steps; i++) {
            const { x: oldX, y: oldY } = this.entity.position;
            const newX = oldX + moveX;
            const newY = oldY + moveY;

            // Always allow sub-pixel movement.
            const subpixelX = Math.floor(oldX) === Math.floor(newX);
            const subpixelY = Math.floor(oldY) === Math.floor(newY);
            if (subpixelX && subpixelY) {
                this.entity.position.x = newX;
                this.entity.position.y = newY;
            }
            // First, we try the double pixel special
            else if (!subpixelX && !subpixelY) {
                if (!this.blocked[moveDirY]![moveDirX]) {
                    this.entity.position.x = newX;
                    this.entity.position.y = newY;
                    this.computeBlockages(map, hitbox);
                }
                // Uh oh, something is bad. Let's try just X
                else if (!this.blocked[1]![moveDirX]) {
                    this.entity.position.x = newX;
                    this.velocity.y = 0;
                    moveDirY = 1;
                    moveY = 0;
                    this.computeBlockages(map, hitbox);
                }
                // No? How about Y?
                else if (!this.blocked[moveDirY]![1]) {
                    this.entity.position.y = newY;
                    this.velocity.x = 0;
                    moveDirX = 1;
                    moveX = 0;
                    this.computeBlockages(map, hitbox);
                }
                // Well shit, rip
                else {
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                    moveDirX = 1;
                    moveDirY = 1;
                    moveX = 0;
                    moveY = 0;
                }
            }
            // Barring that, it's horizontal time
            else if (subpixelY) {
                this.entity.position.y = newY;
                if (!this.blocked[1]![moveDirX]) {
                    this.entity.position.x = newX;
                    this.computeBlockages(map, hitbox);
                }
                else {
                    // Blocked aww bummer
                    this.velocity.x = 0;
                    moveDirX = 1;
                    moveX = 0;
                }
            }
            // Finally, verticality
            else {
                this.entity.position.x = newX;
                if (!this.blocked[moveDirY]![1]) {
                    this.entity.position.y = newY;
                    this.computeBlockages(map, hitbox);
                }
                else {
                    // Blocked aww bummer
                    this.velocity.y = 0;
                    moveDirY = 1;
                    moveY = 0;
                }
            }
        }
    }
}