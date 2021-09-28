import { Component, Entity, Point, Sound } from "../../lib/juicy";
import { getMapFromComponent } from "../helpers/quick-get";
import { TileInfo } from "../helpers/tiles";
import { PlayerPhysics } from "./player-physics";
import { Hitbox } from "./stupid-hitbox";
import { Transitioner } from "./transitioner";

export class SensitiveFeet extends Component {
    ouching = false;
    lastSafe!: Point;
    callback?: (lastSafePosition: Point) => void;

    onPoke(callback: (lastSafePosition: Point) => void) {
        this.callback = callback;
    }

    update(dt: number) {
        if (!this.lastSafe) {
            this.lastSafe = this.entity.position.copy();
        }

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

        // Test map collision
        const { min, max } = hitbox.getBounds();

        // Little bit of grace
        max.y -= 8;
        const tileMin = map.getTileCoords(min);
        const tileMax = map.getTileCoords(max);

        // Check every tile we overlap with.
        let ouch = false;
        for (let tx = tileMin.x; tx <= tileMax.x; tx++) {
            for (let ty = tileMin.y; ty <= tileMax.y; ty++) {
                const tile = map.getTile(tx, ty);

                if (TileInfo[tile].killer) {
                    ouch = true;
                }
            }
        }

        if (ouch && !this.ouching) {
            this.ouching = true;
            // Sound.Load('Drown',
            //     {
            //         src: './audio/drown.wav',
            //         isSFX: true,
            //         volume: 0.2
            //     })
            // Sound.Play('Drown')
            if (transitioner) {
                transitioner.transition({
                    type: 'Spiked',
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
        else if (!ouch) {
            // Stay a safe distance away from edges.
            if (
                physics?.isBlocked(0, 1) &&
                physics?.isBlocked(3 * (max.x - min.x), 1) &&
                physics?.isBlocked(3 * (min.x - max.x), 1)
            ) {
                this.lastSafe = this.entity.position.copy();
            }
            this.ouching = false;
        }
    }
}