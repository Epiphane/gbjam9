import { Component, Entity, Point } from "../../lib/juicy";
import { PhysicsBody } from "./physics";
import { PlayerPhysics } from "./player-physics";
import { Animation, SpriteComponent } from "./sprite";
import { CircleParticle } from "./particle-manager";
import { getParticlesFromComponent } from "../helpers/quick-get";
import { ColorType } from "../helpers/palette";

export const PlayerAnimations = {
    GainingForm: {
        name: 'GainingForm',
        sheet: [0],
        frameTime: 0.75,
        repeat: true,
    },
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

// Verify that PlayerAnimations conforms to { string : Animation }, but
//      still allows for autocompletion of .Falling, .Jumping etc.
{ const _ = PlayerAnimations as { [key: string]: Animation } }

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
            .runAnimation(PlayerAnimations.Idle);
        this.sprite.oncompleteanimation = this.onAnimationComplete.bind(this);
        this.physics = e.get(PlayerPhysics) || e.get(PhysicsBody);
    }

    onAnimationComplete() {
        this.attacking = false;
    }

    trigger(event: PlayerAnimationEvent) {
        if (event == PlayerAnimationEvent.Attack) {
            this.sprite.runAnimation(PlayerAnimations.Attack);
            this.attacking = true;
        }
    }

    update(dt: number) {
        if (!this.sprite) {
            return;
        }

        const wasFalling = this.falling;

        if (this.physics?.isActive()) {
            this.moving = this.physics.velocity.x != 0;
            this.jumping = this.physics.velocity.y < 0;
            this.falling = this.physics.velocity.y > 0;
        }

        if (wasFalling && !this.falling) {
            // TODO-EF: Helper functions that do all this math junk for you
            const leftParticle = new CircleParticle(
                0.2,
                (p, dt) => {
                    p.origin.x += p.velocity.x * dt;
                    p.velocity.x += dt * 800;
                    p.lifespan -= dt;
                    return p.lifespan > 0;
                },
                this.entity.position.copy().add(new Point((this.sprite?.spriteWidth ?? 0) / 2, (this.sprite?.spriteHeight ?? 0) - 2)),
                new Point(-150, 0),
                1,
                ColorType.Dark
            );

            const rightParticle = new CircleParticle(
                0.2,
                (p, dt) => {
                    p.origin.x += p.velocity.x * dt;
                    p.velocity.x -= dt * 800;
                    p.lifespan -= dt;
                    return p.lifespan > 0;
                },
                this.entity.position.copy().add(new Point((this.sprite?.spriteWidth ?? 0) / 2, (this.sprite?.spriteHeight ?? 0) - 2)),
                new Point(150, 0),
                1,
                ColorType.Dark
            );

            getParticlesFromComponent(this)?.addParticle(leftParticle);
            getParticlesFromComponent(this)?.addParticle(rightParticle);
        }

        if (this.attacking) {
            return;
        }

        if (this.jumping) {
            this.sprite.runAnimation(PlayerAnimations.Jumping);
        }
        else if (this.falling) {
            this.sprite.runAnimation(PlayerAnimations.Falling);
        }
        else if (!this.moving) {
            this.sprite.runAnimation(PlayerAnimations.Idle);
        }
        else {
            this.sprite.runAnimation(PlayerAnimations.Walk);
        }
    }
}