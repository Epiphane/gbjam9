import { Sound } from "../../../lib/juicy";
import { Point } from "juicy.point";
import { __HITBOXES__ } from "../../helpers/debug";
import { getCameraFromComponent, getMapFromComponent } from "../../helpers/quick-get";
import { TileInfo } from "../../helpers/tiles";
import { Health } from "../health";
import { PlayerAnimation, PlayerAnimationEvent, PlayerAnimations } from "../player-animation";
import { SpriteComponent } from "../sprite";
import { Hitbox } from "../stupid-hitbox";
import { PlayerForm } from "./player-form";
import { PlayerPhysics } from "../player-physics";

Sound.Load('BigJump',
    {
        src: './audio/bigjump.wav',
        isSFX: true,
        loop: false,
        volume: 0.2
    });

Sound.Load('Rumble', {
    src: './audio/rumble.wav',
    isSFX: true,
    volume: 0.05
});

export class UpshotForm extends PlayerForm {
    engaged = false;
    firingThrusters = false;
    recoil = 0;

    startAction() {
        if (!this.engaged) {
            Sound.Play('BigJump');
        }

        this.engaged = true;
        this.entity.get(SpriteComponent)?.runAnimation(PlayerAnimations.Jumping);
    }

    endAction() {
        if (this.engaged) {
            this.engaged = false;
            this.firingThrusters = true;
        }
    }

    update(dt: number) {
        if (this.firingThrusters) {
            const physics = this.entity.get(PlayerPhysics)!;

            physics.velocity.y = -300;
            if (physics.isBlocked(0, -1)) {
                if (this.recoil <= 0) {
                    const camera = getCameraFromComponent(this);
                    camera?.shake(0.3);
                    this.recoil = 0.3;
                    Sound.Play('Rumble');
                }
                else {
                    this.recoil -= dt;
                    if (this.recoil < 0) {
                        this.firingThrusters = false;
                    }
                }
            }
        }
    }

    render(ctx: CanvasRenderingContext2D) {
    }
}