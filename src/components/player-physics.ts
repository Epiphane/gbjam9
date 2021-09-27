import { Game, Point, Sound } from "../../lib/juicy";
import { Keys } from "../helpers/constants";
import { TileInfo } from "../helpers/tiles";
import { MapComponent } from "./map";
import { PhysicsBody } from "./physics";
import { SpriteComponent } from "./sprite";
import { Hitbox } from "./stupid-hitbox";

export class PlayerPhysics extends PhysicsBody {
    coyote = 0;
    jumpTail = 0;
    upWasPressed = false;
    cancelNextJump = false;

    maxDashTime = 0.3;
    dashTime = 0;
    dashDir = 0;

    maxKnockTime = 0.3;
    knockTime = 0;
    knockDir = 0;

    isDashing() {
        return this.dashTime > 0;
    }

    dash() {
        this.dashTime = this.maxDashTime;

        if (Game.keyDown(Keys.LEFT)) {
            this.dashDir = -1;
        }
        else if (Game.keyDown(Keys.RIGHT)) {
            this.dashDir = 1;
        }
        else {
            this.dashDir = this.entity.get(SpriteComponent)?.flip ? -1 : 1;
        }
    }

    isKnockedBack() {
        return this.knockTime > 0;
    }

    knockBack(dx: number) {
        this.knockDir = dx;
        this.knockTime = this.maxKnockTime;
        this.entity.get(SpriteComponent)?.setFlip(dx > 0);
    }

    update(dt: number, game: typeof Game) {
        if (this.dashTime > 0) {
            const progress = this.dashTime / this.maxDashTime;
            const speed = 250 * Math.pow(progress, 0.25);

            this.velocity.x = this.dashDir * speed;
            this.velocity.y = 0;

            this.dashTime -= dt;
            this.hover = true;
        }
        else if (this.knockTime > 0) {
            const progress = this.knockTime / this.maxKnockTime;
            const speed = Math.pow(progress, 0.25);

            this.velocity.x = this.knockDir * speed;
            this.velocity.y = 0;

            this.knockTime -= dt;
        }
        else {
            this.velocity.x = 0;
            if (game.keyDown(Keys.LEFT)) {
                this.entity.get(SpriteComponent)?.setFlip(true);
                this.velocity.x = -90;
            }
            if (game.keyDown(Keys.RIGHT)) {
                this.entity.get(SpriteComponent)?.setFlip(false);
                this.velocity.x = 90;
            }
            this.hover = false;
        }

        if (this.blocked[2]![1]) {
            this.coyote = 0.05;
        }
        else {
            this.coyote -= dt;
        }

        if (!this.cancelNextJump && game.keyDown(Keys.UP)) {
            // Start jump
            if (this.coyote > 0 && !this.upWasPressed) {
                Sound.Load('Jump',
                    {
                        src: './audio/jump.wav',
                        isSFX: true,
                        volume: 0.2
                    });
                Sound.Play('Jump');
                this.velocity.y = -150;
                this.jumpTail = 0.3;
                this.coyote = 0;
            }
            else if (this.jumpTail > 0 && this.velocity.y < 0) {
                this.jumpTail -= dt;
                this.velocity.y -= this.jumpTail * 150;
                this.velocity.y = Math.max(this.velocity.y, -150);
            }
            this.upWasPressed = true;
        }
        else {
            if (this.upWasPressed && this.jumpTail > 0.2) {
                this.velocity.y = this.terminalVelocity;
            }
            this.jumpTail = 0;
            this.upWasPressed = false;
        }

        super.update(dt, game);

        if (!game.keyDown(Keys.UP) && this.blocked[2]![1]) {
            this.jumpTail = 0;
        }
        this.cancelNextJump = false;
    }
};