import { Component, Entity, Point, Sound } from "../../lib/juicy";
import { SaveManager } from "../helpers/save-manager";
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
            // Since onDie gets called even if something's already dead
            // the sound will keep playing if player keeps beating up frog.
            // Not sure if bug or feature
            Sound.Play('FrogDie');
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
            entity.get(PhysicsBody)?.setActive(false);

            SaveManager.set('frogman_dead', entity.position);
        });

        const deathSpot = SaveManager.get('frogman_dead');
        if (deathSpot) {
            entity.position = new Point(deathSpot.x, deathSpot.y);
            health?.takeDamage(health.maxHealth);
        } else {
            // Only load frog death sound if it's not already dead from savefile
            Sound.Load('FrogDie',
                {
                    src: './audio/frog_die.wav',
                    isSFX: true,
                    volume: 0.3
                });
        }
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
                Sound.Load('Rumble',
                    {
                        src: './audio/rumble.wav',
                        isSFX: true,
                        volume: 0.2
                    });
                Sound.Play('Rumble');
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