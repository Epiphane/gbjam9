import { Component } from "../../lib/juicy";
import { Teleporter } from "../helpers/map-loader";
import { MapComponent } from "./map";
import { Hitbox } from "./stupid-hitbox";

type TeleportCallback = (tp: Teleporter) => void;

export class MapTraveller extends Component {
    active = true;
    callback?: TeleportCallback;

    onTeleport(cb: TeleportCallback) {
        this.callback = cb;
    }

    spawn(map: MapComponent, source?: string) {
        let found = false;
        map.spawners.forEach(spawner => {
            if (spawner.source === source) {
                this.entity.position = spawner.position.copy();
                found = true;
            }
        });

        if (!found) {
            map.spawners.forEach(spawner => {
                if (!spawner.source) {
                    this.entity.position = spawner.position.copy();
                    found = true;
                }
            });
        }

        if (found) {
            const hitbox = this.entity.get(Hitbox);
            if (!hitbox) {
                console.error(`Can't simulate physics without a hitbox. Add the Hitbox component to your entity`);
                this.active = false;
                return;
            }

            this.entity.position.sub(hitbox.getOffset());
        }
    }

    update() {
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

        map.teleporters.forEach(teleporter => {
            if (hitbox.test(teleporter)) {
                if (this.callback) {
                    this.callback(teleporter);
                }
            }
        });
    }
}