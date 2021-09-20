import { Component, Point } from "../../lib/juicy";
import { MapTraveller } from "./map-traveller";
import { PhysicsBody } from "./physics";
import { PlayerAnimation } from "./player-animation";
import { PlayerPhysics } from "./player-physics";
import { SpriteComponent } from "./sprite";

export interface MoveTransition {
    type: 'Move';
    moveTime: number;
    distance: Point;
}

export type Transition = (MoveTransition) & {
    time: number;
};

const InteractionComponents: (typeof Component)[] = [
    MapTraveller,
    PhysicsBody,
    PlayerPhysics,
];

export class Transitioner extends Component {
    currentTransition?: Transition;
    transitionTime = 0;
    startPosition = new Point();

    disabled: Component[] = [];

    transition(transition: Transition) {
        this.currentTransition = transition;
        this.transitionTime = 0;
        this.disableInteraction();

        switch (this.currentTransition.type) {
        case 'Move':
            this.startPosition = this.entity.position.copy();
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

    update(dt: number) {
        let prevTime = this.transitionTime;
        if (this.currentTransition) {
            this.transitionTime += dt;

            switch (this.currentTransition.type) {
            case 'Move':
                const anims = this.entity.get(PlayerAnimation);
                const sprite = this.entity.get(SpriteComponent);
                const moved = Math.min(this.transitionTime, this.currentTransition.moveTime);
                const progress = moved / (this.currentTransition.moveTime);
                this.entity.position = this.startPosition.copy().add(this.currentTransition.distance.copy().mult(new Point(progress)));

                sprite?.setFlip(this.currentTransition.distance.x < 0)
                if (anims) {
                    anims.moving = (progress < 1);
                }
                break;
            }

            if (this.transitionTime >= this.currentTransition.time) {
                this.currentTransition = undefined;
                this.transitionTime = 0;
                this.enableInteraction();
            }
        }
    }
}