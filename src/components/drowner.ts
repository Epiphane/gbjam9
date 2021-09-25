import { Component, Point } from "../../lib/juicy";
import { getMapFromComponent } from "../helpers/quick-get";
import { TileInfo } from "../helpers/tiles";
import { PlayerPhysics } from "./player-physics";
import { Hitbox } from "./stupid-hitbox";
import { Transitioner } from "./transitioner";

export class Drowner extends Component {
    drowning = false;
    lastSafe = new Point();
    callback?: (lastSafePosition: Point) => void;

    onDrown(callback: (lastSafePosition: Point) => void) {
        this.callback = callback;
    }

    update(dt: number) {
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

        const transitioner = this.entity.get(Transitioner);
        const physics = this.entity.get(PlayerPhysics);

        if (this.drowning) {

        }

        // Test map collision
        const { min, max } = hitbox.getBounds();

        // Little bit of grace
        max.y -= 4;
        const tileMin = map.getTileCoords(min);
        const tileMax = map.getTileCoords(max);

        // Check every tile we overlap with.
        let drown = false;
        for (let tx = tileMin.x; tx <= tileMax.x; tx++) {
            for (let ty = tileMin.y; ty <= tileMax.y; ty++) {
                const tile = map.getTile(tx, ty);

                if (TileInfo[tile].mustSwim) {
                    drown = true;
                }
            }
        }

        if (drown && !this.drowning) {
            this.drowning = true;
            if (transitioner) {
                transitioner.transition({
                    type: 'Drown',
                    time: 1,
                    onComplete: () => {
                        if (this.callback) {
                            this.callback(this.lastSafe);
                        }
                        else {
                            this.entity.position = this.lastSafe;
                        }
                    },
                });
            }
            else if (this.callback) {
                this.callback(this.lastSafe);
            }
            else {
                this.entity.position = this.lastSafe;
            }
        }
        else if (!drown) {
            // Stay a safe distance away from edges.
            if (
                physics?.isBlocked(0, 1) &&
                physics?.isBlocked(3 * (max.x - min.x), 1) &&
                physics?.isBlocked(3 * (min.x - max.x), 1)
            ) {
                this.lastSafe = this.entity.position.copy();
            }
            this.drowning = false;
        }
    }
}