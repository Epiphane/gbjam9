import { Component, Entity } from "../../lib/juicy";
import { PhysicsBody } from "./physics";
import { PlayerPhysics } from "./player-physics";
import { SpriteComponent } from "./sprite";
import { Animation } from "./sprite";

export const Animations: { [key: string]: Animation } = {
    Idle: {
        name: 'Idle',
        sheet: [0, 1, 2, 3],
        frameTime: 0.75,
        repeat: true,
    },
    Walk: {
        name: 'Walk',
        sheet: [4, 5, 6, 7],
        frameTime: 0.15,
        repeat: true,
    },
    Attack: {
        name: 'Attack',
        sheet: [8],
        frameTime: 0.15,
    },
    Jumping: {
        name: 'Jumping',
        sheet: [9],
        frameTime: 0.15,
        repeat: true,
    },
    Falling: {
        name: 'Falling',
        sheet: [10],
        frameTime: 0.15,
        repeat: true,
    },
};

export enum PlayerAnimationEvent {
    Attack,
};

export class PlayerAnimation extends Component {
    sprite!: SpriteComponent;
    physics?: PhysicsBody;

    moving = false;
    jumping = false;
    falling = false;

    attacking = false;

    init(e: Entity) {
        const sprite = e.get(SpriteComponent);
        if (!sprite) {
            throw 'PlayerAnimation added without a SpriteComponent';
        }

        this.sprite = sprite;
        this.sprite
            .setImage('./images/boy.png')
            .setSize(32, 24)
            .runAnimation(Animations.Idle);
        this.sprite.oncompleteanimation = this.onAnimationComplete.bind(this);
        this.physics = e.get(PlayerPhysics) || e.get(PhysicsBody);
    }

    onAnimationComplete() {
        this.attacking = false;
    }

    trigger(event: PlayerAnimationEvent) {
        if (event == PlayerAnimationEvent.Attack) {
            this.sprite.runAnimation(Animations.Attack);
            this.attacking = true;
        }
    }

    update(dt: number) {
        if (!this.sprite) {
            return;
        }

        if (this.physics?.isActive()) {
            this.moving = this.physics.velocity.x != 0;
            this.jumping = this.physics.velocity.y < 0;
            this.falling = this.physics.velocity.y > 0;
        }

        if (this.attacking) {
            return;
        }

        if (this.jumping) {
            this.sprite.runAnimation(Animations.Jumping);
        }
        else if (this.falling) {
            this.sprite.runAnimation(Animations.Falling);
        }
        else if (!this.moving) {
            this.sprite.runAnimation(Animations.Idle);
        }
        else {
            this.sprite.runAnimation(Animations.Walk);
        }
    }
}