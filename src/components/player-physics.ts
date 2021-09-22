import { Game, Point } from "../../lib/juicy";
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

    constructor() {
        super();

        this.terminalVelocity = 200;
    }

    update(dt: number, game: typeof Game) {
        this.velocity.x = 0;
        if (game.keyDown(Keys.LEFT)) {
            this.entity.get(SpriteComponent)?.setFlip(true);
            this.velocity.x = -90;
        }
        if (game.keyDown(Keys.RIGHT)) {
            this.entity.get(SpriteComponent)?.setFlip(false);
            this.velocity.x = 90;
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
                this.velocity.y = -150;
                this.jumpTail = 0.5;
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