import { Entity, Component, Point, Game } from "../../lib/juicy";
import { MapObject } from "../helpers/map-loader";
import { getMapFromComponent } from "../helpers/quick-get";
import { SaveManager } from "../helpers/save-manager";
import { Birb, BirbDetectionRadius } from "./birb";
import { Camera } from "./camera";
import { MapComponent } from "./map";
import { PlayerAnimations } from "./player-animation";
import { PlayerPhysics } from "./player-physics";
import { SpriteComponent } from "./sprite";
import { Hitbox } from "./stupid-hitbox";
import { Transitioner } from "./transitioner";

export class PlayerEvents extends Component {
    map?: MapComponent;
    hitbox?: Hitbox;
    transitioner?: Transitioner;

    private getComponents() {
        if (!this.map) {
            this.map = getMapFromComponent(this);
            if (!this.map) {
                console.error('No map!');
                this.setActive(false);
                return;
            }
        }

        if (!this.hitbox) {
            this.hitbox = this.entity.get(Hitbox);
            if (!this.hitbox) {
                console.error('No hitbox!');
                this.setActive(false);
                return;
            }
        }

        if (!this.transitioner) {
            this.transitioner = this.entity.get(Transitioner);
            if (!this.transitioner) {
                console.error('No transitioner!');
                this.setActive(false);
                return;
            }
        }
    }

    update(dt: number) {
        this.getComponents();

        this.map!.triggers.forEach(trigger => {
            if (this.hitbox!.test(trigger)) {
                this.trigger(trigger);
            }
        });
    }

    trigger(obj: MapObject) {
        if (obj.properties.inactive) {
            return;
        }

        const onGround = this.entity.get(PlayerPhysics)?.isBlocked(0, 1);
        if (obj.name === 'FrogBoss' && onGround) {
            this.frogBossFight();
            obj.properties.inactive = true;
        }
        else if (obj.name === 'BirbMom' && onGround) {
            this.birbMomNoSpoilers();
            obj.properties.inactive = true;
        }
    }

    birbMomNoSpoilers() {
        if (SaveManager.get('birb_bait')) {
            return;
        }

        // Stop falling
        this.entity.get(SpriteComponent)?.runAnimation(PlayerAnimations.Idle);

        // Set bounds
        const camera = this.entity.state.get('camera')?.get(Camera)!;
        const { min, max } = camera.bounds;
        camera.setBounds({
            min: new Point(max.x - Game.size.x, min.y),
            max,
        });

        // Kill mom
        const mom = this.entity.state.get('BirbMom')!;
        const sprite = mom.get(SpriteComponent)!;
        const transitioner = this.entity.get(Transitioner);
        transitioner?.disableInteraction();
        sprite.runAnimation({
            name: 'Die',
            sheet: [1, 2, 3, 3, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            frameTime: 2,
            repeat: false,
        });
        sprite.oncompleteanimation = () => {
            sprite.dissolve();
            getMapFromComponent(this)?.removeFromBackground(mom);

            // This is lazy as shit but I don't really care:
            // After the animation Birb Mother takes 3.5 seconds
            // to dissolve, so we wait 4 (for dramatic effect)
            // and then enable interaction.
            setTimeout(() => {
                SaveManager.set('birb_bait', true);
                this.entity.state.entities.forEach(e => {
                    const birb = e.get(Birb);
                    if (birb) {
                        birb.detectionRadius = BirbDetectionRadius.mid;
                    }
                })
                transitioner?.enableInteraction();
                camera.setBounds({ min, max });
            }, 4);
        }
    }

    frogBossFight() {
        const camera = this.entity.state.get('camera')?.get(Camera)!;
        const { min, max } = camera.bounds;
        camera.setBounds({
            min: new Point(6 * 16, min.y),
            max,
        });
        camera.easing = 30;
        camera.maxEasing = 30;

        this.transitioner?.transition({
            type: 'FrogIntro',
            camera,
            cameraPos: new Point(6 * 16, 7 * 12),
            time: 5,
            onComplete: () => {
                camera.easing = 100;
                camera.maxEasing = 200;
            }
        });

        this.entity.get(SpriteComponent)?.runAnimation(PlayerAnimations.GainingForm);
        this.entity.state.get('SpikeWall')?.get(SpriteComponent)?.runAnimation({
            name: 'New wall just dropped',
            sheet: [1, 2, 3, 4, 5, 6, 7, 8],
            frameTime: 0.05,
            repeat: false,
        });
    }
}