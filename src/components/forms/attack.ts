import { Sound } from "../../../lib/juicy";
import { Point } from "juicy.point";
import { __HITBOXES__ } from "../../helpers/debug";
import { getMapFromComponent } from "../../helpers/quick-get";
import { TileInfo } from "../../helpers/tiles";
import { Health } from "../health";
import { PlayerAnimation, PlayerAnimationEvent } from "../player-animation";
import { SpriteComponent } from "../sprite";
import { Hitbox } from "../stupid-hitbox";
import { PlayerForm } from "./player-form";
import { PlayerPhysics } from "../player-physics";

Sound.Load('Slash', {
    src: './audio/slash.wav',
    isSFX: true,
    volume: 0.07,
});

export class AttackForm extends PlayerForm {
    box?: {
        min: Point;
        max: Point;
    };

    cooldown = 0;

    startAction() {
        if (this.cooldown > 0) {
            return;
        }

        this.cooldown = 0.25;
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

        Sound.Play('Slash');

        for (let i = 0; i < this.entity.state.entities.length; ++i) {
            const e = this.entity.state.entities[i];
            if (e === this.entity) {
                continue;
            }

            const otherHealth = e!.get(Health);
            const otherHitbox = e!.get(Hitbox);
            if (otherHealth?.isActive() && otherHitbox?.isActive()) {
                if (otherHitbox.test({ position: min, size: max.copy().sub(min) })) {
                    otherHealth.takeDamage(1);
                    this.entity.get(PlayerPhysics)?.knockBack(facingRight ? -100 : 100, 0, 0.2)
                }
            }
        }
    }

    update(dt: number) {
        this.cooldown -= dt;
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