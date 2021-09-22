import { Component, Game, Point } from "../../lib/juicy";
import { Keys } from "../helpers/constants";
import { Spawner, SpawnerAction, Teleporter, TeleporterType } from "../helpers/map-loader";
import { MapComponent } from "./map";
import { PhysicsBody } from "./physics";
import { PlayerPhysics } from "./player-physics";
import { Hitbox } from "./stupid-hitbox";
import { Transitioner } from "./transitioner";

type TeleportCallback = (tp: Teleporter) => void;

export class MapTraveller extends Component {
    active = true;
    callback?: TeleportCallback;

    onTeleport(cb: TeleportCallback) {
        this.callback = cb;
    }

    spawn(map: MapComponent, source?: string) {
        let match: Spawner | undefined;
        map.spawners.forEach(spawner => {
            if (spawner.source === source) {
                match = spawner;
            }
        });

        if (!match) {
            map.spawners.forEach(spawner => {
                if (!spawner.source) {
                    match = spawner;
                }
            });
        }

        if (match) {
            const hitbox = this.entity.get(Hitbox);
            if (!hitbox) {
                console.error(`Can't simulate physics without a hitbox. Add the Hitbox component to your entity`);
                this.active = false;
                return;
            }

            this.entity.position = match.position.copy().sub(hitbox.getOffset());
            this.entity.position.y += match.size.y - hitbox.getSize().y;

            const transitioner = this.entity.get(Transitioner);
            if (transitioner) {
                switch (match.action) {
                case SpawnerAction.WalkLeft:
                    transitioner.transition({
                        type: 'Move',
                        distance: new Point(-8, 0),
                        moveTime: 0.5,
                        time: 0.75,
                    });
                    break;
                case SpawnerAction.WalkRight:
                    transitioner.transition({
                        type: 'Move',
                        distance: new Point(8, 0),
                        moveTime: 0.5,
                        time: 0.75,
                    });
                    break;
                }
            }
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

        const physics = this.entity.get(PlayerPhysics);
        const hitbox = this.entity.get(Hitbox);
        if (!hitbox) {
            console.error(`Can't simulate physics without a hitbox. Add the Hitbox component to your entity`);
            this.active = false;
            return;
        }


        map.teleporters.forEach(teleporter => {
            if (hitbox.test(teleporter)) {
                let teleport = false;
                if (teleporter.type === TeleporterType.Normal) {
                    teleport = true;
                }
                else if (teleporter.type === TeleporterType.Door) {
                    if (physics && physics.isBlocked(0, 1) && Game.keyDown(Keys.UP)) {
                        teleport = true;
                        physics.cancelNextJump = true;
                    }
                }

                if (this.callback && teleport) {
                    this.callback(teleporter);
                }
            }
        });
    }
}