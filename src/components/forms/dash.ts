import { PlayerPhysics } from "../player-physics";
import { PlayerForm } from "./player-form";

export class DashForm extends PlayerForm {
    canDash = true;
    cooldown = 0;

    startAction() {
        if (!this.canDash || this.cooldown > 0) {
            return;
        }

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