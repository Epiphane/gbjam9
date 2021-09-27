import { Component, Entity, Game, Point, rand } from "../../lib/juicy";
import { SaveManager } from "../helpers/save-manager";
import { VaniaScreen } from "../states/vania";
import { PhysicsBody } from "./physics";
import { SpriteComponent } from "./sprite";
import { Hitbox } from "./stupid-hitbox";

export class Froggy extends Component {
    jumpCooldown = Math.random() * 1;
    jumpDir = 0;
    windup = 0;
    jumping = false;
    falling = false;

    update(dt: number, game: typeof Game) {
        const physics = this.entity.get(PhysicsBody);
        const sprite = this.entity.get(SpriteComponent);
        if (!physics || !sprite) {
            console.error('Missing physics or sprite');
            this.setActive(false);
            return;
        }

        if (this.jumping) {
            const dy = physics.velocity.y;
            if (this.falling && physics.isBlocked(0, 1)) {
                physics.velocity.x = 0;

                sprite.runAnimation({
                    name: 'Idle',
                    sheet: [0],
                    frameTime: 0.2,
                    repeat: false,
                });
                this.jumpCooldown = Math.random() * 2;
                this.jumping = false;
                return;
            }

            if (dy > 0) {
                sprite?.runAnimation({
                    name: 'Fall',
                    sheet: [3],
                    frameTime: 0.2,
                    repeat: true
                });
                this.falling = true;
            }
            else if (dy < 0) {
                sprite?.runAnimation({
                    name: 'Jump',
                    sheet: [2],
                    frameTime: 0.2,
                    repeat: true
                });
            }
        }
        else if (this.windup > 0) {
            this.windup -= dt;

            if (this.windup <= 0) {
                const speed = 40;
                physics.velocity.x = Math.sign(Math.random() - 0.5) * speed * (0.8 + Math.random() * 0.2);
                physics.velocity.y = -120 - Math.random() * 40;

                sprite.setFlip(physics.velocity.x > 0);
                this.jumping = true;
                this.falling = false;
            }
        }
        else if (this.jumpCooldown <= 0) {
            this.windup = 0.2;
            sprite.runAnimation({
                name: 'Prep',
                sheet: [1],
                frameTime: 1,
                repeat: false,
            });
        }
        else {
            this.jumpCooldown -= dt;
        }
    }
}