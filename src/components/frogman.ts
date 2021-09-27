import { Component, Entity } from "../../lib/juicy";
import { __HITBOXES__ } from "../helpers/debug";
import { Camera } from "./camera";
import { Health } from "./health";
import { Obstacle } from "./obstacle";
import { PhysicsBody } from "./physics";
import { SpriteComponent } from "./sprite";
import { Hitbox } from "./stupid-hitbox";

export class Frogman extends Component {
    hasLanded = false;
    player?: Entity;
    fighting = false;

    init(entity: Entity) {
        const sprite = entity.get(SpriteComponent);
        const health = entity.get(Health);
        const hitbox = entity.get(Hitbox);
        health?.onDie(() => {
            sprite?.runAnimation({
                name: 'Dead',
                sheet: [12],
                frameTime: 0.1,
                repeat: false,
            });

            const obstacle = entity.add(Obstacle);
            obstacle.isAFunnyBouncyBoy = true;
            obstacle.blockDirections.Up = false;
            obstacle.blockDirections.Right = false;
            obstacle.blockDirections.Left = false;

            hitbox?.setSize(40, hitbox.getSize().y);
            this.entity.get(PhysicsBody)?.setActive(false);
        });
    }

    jump() {
        const physics = this.entity.get(PhysicsBody);
        if (physics) {
            physics.velocity.y = -350;
        }
    }

    update(dt: number) {
        this.player = this.entity.state.get('player');

        const health = this.entity.get(Health);
        const physics = this.entity.get(PhysicsBody);
        const sprite = this.entity.get(SpriteComponent);

        if (!health?.isAlive()) {
            return;
        }

        const isOnGround = physics?.isBlocked(0, 1);
        if (isOnGround) {
            sprite?.runAnimation({
                name: 'Stand',
                sheet: [2],
                frameTime: 0.2,
                repeat: true
            });

            if (!this.hasLanded) {
                this.entity.state.get('camera')?.get(Camera)?.shake(0.3);
                this.hasLanded = true;
            }
        }
        else {
            const { y: dy } = physics?.velocity ?? { y: 0 };
            if (Math.abs(dy) < 10) {
                sprite?.runAnimation({
                    name: 'Stand',
                    sheet: [2],
                    frameTime: 0.2,
                    repeat: true
                });
            }
            else if (dy > 0) {
                sprite?.runAnimation({
                    name: 'Fall',
                    sheet: [1],
                    frameTime: 0.2,
                    repeat: true
                });
            }
            else if (dy < 0) {
                sprite?.runAnimation({
                    name: 'Jump',
                    sheet: [8],
                    frameTime: 0.2,
                    repeat: true
                });
            }
        }
    }
}