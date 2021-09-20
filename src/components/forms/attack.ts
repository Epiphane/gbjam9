import { PlayerAnimation, PlayerAnimationEvent } from "../player-animation";
import { PlayerForm } from "./player-form";

export class AttackForm extends PlayerForm {
    startAction() {
        this.entity.get(PlayerAnimation)?.trigger(PlayerAnimationEvent.Attack);
    }
}