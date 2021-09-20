import { PlayerAnimation, PlayerAnimationEvent } from "../player-animation";
import { PlayerForm } from "./player-form";

export class AttackForm extends PlayerForm {
    doAction() {
        this.entity.get(PlayerAnimation)?.trigger(PlayerAnimationEvent.Attack);
    }
}