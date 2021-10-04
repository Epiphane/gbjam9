import { Game, Point, Sound } from "../../lib/juicy";
import { Keys } from "../helpers/constants";
import { SaveManager } from "../helpers/save-manager";
import { TileInfo } from "../helpers/tiles";
import { ISMOBILE } from "../main";
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

    doubleJumpPower = SaveManager.get('DoubleJump') ?? false;
    canDoubleJump = true;

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

    knockBack(dx: number, dy?: number, time?: number) {
        this.knockDir = dx;
        this.knockTime = time ?? this.maxKnockTime;
        this.entity.get(SpriteComponent)?.setFlip(dx > 0);
        this.velocity.y = dy ?? 0;
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
            this.canDoubleJump = true;
        }
        else {
            this.coyote -= dt;
        }

        const shouldJump = ISMOBILE ? game.keyDown(Keys.A) : game.keyDown(Keys.UP);
        if (!this.cancelNextJump && shouldJump) {
            // Start jump
            const doubleJump = (this.canDoubleJump && this.doubleJumpPower);
            if ((this.coyote > 0 || doubleJump) && !this.upWasPressed) {
                if (this.coyote <= 0) {
                    this.canDoubleJump = false;
                }

                Sound.Load('Jump',
                    {
                        src: './audio/jump.wav',
                        isSFX: true,
                        volume: 0.2
                    });
                Sound.Play('Jump');
                this.velocity.y = -150;
                this.jumpTail = 0.335;
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

        if (!shouldJump && this.blocked[2]![1]) {
            this.jumpTail = 0;
        }
        this.cancelNextJump = false;
    }
};