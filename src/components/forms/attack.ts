import { Point } from "juicy.point";
import { __HITBOXES__ } from "../../helpers/debug";
import { getMapFromComponent } from "../../helpers/quick-get";
import { TileInfo } from "../../helpers/tiles";
import { PlayerAnimation, PlayerAnimationEvent } from "../player-animation";
import { SpriteComponent } from "../sprite";
import { Hitbox } from "../stupid-hitbox";
import { PlayerForm } from "./player-form";

export class AttackForm extends PlayerForm {
    box?: {
        min: Point;
        max: Point;
    };

    startAction() {
        this.entity.get(PlayerAnimation)?.trigger(PlayerAnimationEvent.Attack);

        const facingRight = !this.entity.get(SpriteComponent)?.flip;
        const bounds = this.entity.get(Hitbox)?.getBounds();
        if (!bounds) {
            return;
        }

        let { min, max } = bounds;

        if (facingRight) {
            min.x = max.x;
            max.x += 14;
        }
        else {
            max.x = min.x;
            min.x -= 14;
        }

        this.box = { min, max };

        const map = getMapFromComponent(this);
        if (map) {
            const minTile = map.getTileCoords(this.box.min);
            const maxTile = map.getTileCoords(this.box.max);
            for (let x = minTile.x; x <= maxTile.x; x++) {
                for (let y = minTile.y; y <= maxTile.y; y++) {
                    const tile = map.getTile(x, y);
                    if (TileInfo[tile].breaksInto) {
                        map.breakTile(x, y);
                    }
                }
            }
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        if (__HITBOXES__ && this.box) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                Math.floor(this.box.min.x - this.entity.position.x) + 0.5,
                Math.floor(this.box.min.y - this.entity.position.y) + 0.5,
                Math.floor(this.box.max.x - this.box.min.x),
                Math.floor(this.box.max.y - this.box.min.y)
            );
        }
    }
}