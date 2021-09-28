import { Sound } from "../../../lib/juicy";
import { PlayerPhysics } from "../player-physics";
import { PlayerForm } from "./player-form";

Sound.Load('Dash',
    {
        src: './audio/dash.wav',
        isSFX: true,
        volume: 0.2
    });


export class DashForm extends PlayerForm {
    canDash = true;
    cooldown = 0;

    startAction() {
        if (!this.canDash || this.cooldown > 0) {
            return;
        }

        Sound.Play('Dash')

        const physics = this.entity.get(PlayerPhysics);
        physics?.dash();
        this.cooldown = 0.5;
        this.canDash = false;
    }

    update(dt: number) {
        if (this.cooldown > 0) {
            this.cooldown -= dt;
        }

        if (this.entity.get(PlayerPhysics)?.isBlocked(0, 1)) {
            this.canDash = true;
        }
    }
}