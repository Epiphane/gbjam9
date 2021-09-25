import { Component, Point } from "../../lib/juicy";
import { PowerupAnimations } from "../helpers/powerup";
import { MapTraveller } from "./map-traveller";
import { PhysicsBody } from "./physics";
import { PlayerAnimation, PlayerAnimations } from "./player-animation";
import { PlayerPhysics } from "./player-physics";
import { SpriteComponent } from "./sprite";

export interface MoveTransition {
    type: 'Move';
    moveTime: number;
    distance: Point;
}

export interface GetFormTransition {
    type: 'GetForm';
    powerup: SpriteComponent;
}

export interface DrownTransition {
    type: 'Drown';
}

export type Transition = (MoveTransition | GetFormTransition | DrownTransition) & {
    time: number;
    onComplete?: () => void;
};

interface MoveProps {
    startPosition: Point;
}

interface GetFormProps {
    playerStart: Point;
    powerupStart: Point;
}

const InteractionComponents: (typeof Component)[] = [
    MapTraveller,
    PlayerAnimation,
    PhysicsBody,
    PlayerPhysics,
];

export class Transitioner extends Component {
    currentTransition?: Transition;
    transitionTime = 0;
    props?: MoveProps | GetFormProps;

    disabled: Component[] = [];

    transition(transition: Transition) {
        this.currentTransition = transition;
        this.transitionTime = 0;
        this.disableInteraction();

        const physics = this.entity.get(PlayerPhysics);
        if (physics) {
            physics.velocity.x = physics.velocity.y = 0;
        }

        switch (this.currentTransition.type) {
        case 'Move':
            this.props = {
                startPosition: this.entity.position.copy(),
            };
            break;
        case 'GetForm':
            this.props = {
                playerStart: this.entity.position.copy(),
                powerupStart: this.currentTransition.powerup.entity.position.copy(),
            };
            break;
        case 'Drown':
            break;
        }
    }

    enableInteraction() {
        this.disabled.forEach(c => c.setActive(true));
        this.disabled = [];
    }

    disableInteraction() {
        InteractionComponents.forEach(c => {
            const component = this.entity.get(c);
            if (component?.isActive()) {
                this.disabled.push(component);
                component.setActive(false);
            }
        });
    }

    updateFormAnimation() {
        if (!this.currentTransition || this.currentTransition.type !== 'GetForm') {
            return;
        }

        const { powerup, time } = this.currentTransition;
        const { playerStart, powerupStart } = this.props as GetFormProps;
        const progress = Math.min(this.transitionTime / time, 1);

        // Phase times
        const Part1End = 0.2;
        const Part2End = 0.8;
        const Part3End = 0.85;
        const Part4End = 0.95;

        const sprite = this.entity.get(SpriteComponent);
        if (progress < Part2End) {
            sprite?.runAnimation(PlayerAnimations.GainingForm);
        }

        // Compute spinning the powerup
        const outwardDir = Math.sign(powerupStart.x + powerup.entity.width / 2 - playerStart.x - this.entity.width / 2);
        const armLength = 25;
        const arm = new Point(outwardDir * armLength, 0);
        if (progress > Part1End) {
            const spinProgress = 1.1 * (progress - Part1End) / (Part2End - Part1End);
            let armProportion = 1 - Math.pow(spinProgress, 2);
            if (spinProgress > 1 && progress <= Part2End) {
                armProportion = 1 - Math.pow(2 * (spinProgress - 1.05) / 0.1, 2);
            }
            const angle = (60 * Math.PI * Math.pow(spinProgress, 3)) % (2 * Math.PI);
            arm.x = armProportion * armLength * outwardDir * Math.cos(angle);
            arm.y = -armProportion * armLength * outwardDir * Math.sin(angle);

            if (angle > Math.PI / 4 && angle <= 3 * Math.PI / 4) {
                powerup.runAnimation(PowerupAnimations.FlyLeft);
            }
            else if (angle > 3 * Math.PI / 4 && angle <= 5 * Math.PI / 4) {
                powerup.runAnimation(PowerupAnimations.FlyDown);
            }
            else if (angle > 5 * Math.PI / 4 && angle <= 7 * Math.PI / 4) {
                powerup.runAnimation(PowerupAnimations.FlyRight);
            }
            else {
                powerup.runAnimation(PowerupAnimations.FlyUp);
            }
        }

        // Elevate the player
        const playerEnd = new Point(0, -25).add(playerStart);
        const powerupEnd = playerEnd.copy().add((this.entity.width - powerup.entity.width) / 2, 5);

        if (progress < Part1End) {
            powerup.runAnimation(PowerupAnimations.FlyUp);

            const floatProgress = progress / Part1End;
            this.entity.position = playerEnd.mult(floatProgress).add(playerStart.copy().mult(1 - floatProgress));
            powerup.entity.position = powerupEnd.mult(floatProgress).add(powerupStart.copy().mult(1 - floatProgress)).add(arm.mult(floatProgress));
            return;
        }
        else {
            this.entity.position = playerEnd;
            powerup.entity.position = powerupEnd.add(arm);
        }

        // Wait a spell
        if (progress < Part2End) {
            return;
        }

        powerup.setActive(false);
        if (progress < Part3End) {
            return;
        }

        if (progress < Part4End) {
            const floatProgress = (progress - Part3End) / (Part4End - Part3End);
            this.entity.position = playerEnd.mult(1 - floatProgress).add(playerStart.copy().mult(floatProgress));
            return;
        }
        else {
            this.entity.position = playerStart;
        }
    }

    update(dt: number) {
        if (this.currentTransition) {
            this.transitionTime += dt;

            switch (this.currentTransition.type) {
            case 'Move':
                const sprite = this.entity.get(SpriteComponent);
                const moved = Math.min(this.transitionTime, this.currentTransition.moveTime);
                const progress = moved / (this.currentTransition.moveTime);
                const { startPosition } = this.props as MoveProps;
                this.entity.position = startPosition.copy().add(this.currentTransition.distance.copy().mult(new Point(progress)));

                sprite?.setFlip(this.currentTransition.distance.x < 0)
                sprite?.runAnimation(progress < 1 ? PlayerAnimations.Walk : PlayerAnimations.Idle)
                break;
            case 'GetForm':
                this.updateFormAnimation();
                break;
            case 'Drown':
                this.entity.get(SpriteComponent)?.runAnimation(PlayerAnimations.Drowning);
                break;
            }

            if (this.transitionTime >= this.currentTransition.time) {
                this.enableInteraction();
                if (this.currentTransition.onComplete) {
                    this.currentTransition.onComplete();
                }
                this.currentTransition = undefined;
                this.transitionTime = 0;
            }
        }
    }
}