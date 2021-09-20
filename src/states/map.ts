import {
    State,
    Point,
    Entity,
    Game,
    ImageComponent,
} from "../../lib/juicy";
import { Hitbox } from "../components/stupid-hitbox";
import { MapComponent } from "../components/map";
import { SpriteComponent } from "../components/sprite";
import { PaletteSelectionScreen } from "./palette-selector";
import { PlayerPhysics } from "../components/player-physics";
import { Camera } from "../components/camera";
import { PlayerAnimation } from "../components/player-animation";
import { PlayerForm } from "../components/forms/player-form";
import { AttackForm } from "../components/forms/attack";

export class MapScreen extends State {
    player: Entity;
    camera: Entity;
    ui: Entity;
    ready = false;

    constructor() {
        super();

        const mapEntity = new Entity(this, 'map', [MapComponent]);
        mapEntity.get(MapComponent)
            ?.load('test')
            .then(() => {
                this.ready = true;
                this.camera.get(Camera)?.setBounds({
                    min: new Point(),
                    max: new Point(mapEntity.width, mapEntity.height)
                });
            });

        this.player = new Entity(this, [SpriteComponent, Hitbox, PlayerPhysics, PlayerAnimation]);
        this.player.position.x = 46;
        this.player.position.y = 9 * 12;

        const hitbox = this.player.get(Hitbox)!;
        hitbox.setOffset(13, 5);
        hitbox.setSize(6, 19);

        this.camera = new Entity(this, [Camera]);
        this.camera.get(Camera)?.follow(this.player);

        // Player forms!
        this.player.add(AttackForm);

        // Making UI lol
        this.ui = new Entity(this);
        this.remove(this.ui);

        // Haha I'm hacking hahaha
        const formFrame = this.ui.addChild(new Entity(this, [SpriteComponent]));
        formFrame.get(SpriteComponent)
            ?.setImage('./images/forms.png')
            .setSize(20, 20)
            .runAnimation({ name: 'Frame', frameTime: 0, repeat: true, sheet: [0]});

        const formType = this.ui.addChild(new Entity(this, [SpriteComponent]));
        formType.get(SpriteComponent)
            ?.setImage('./images/forms.png')
            .setSize(20, 20)
            .runAnimation({ name: 'Frame', frameTime: 0, repeat: true, sheet: [1]});
    }

    init() {
    }

    key_SELECT() {
        this.game.setState(new PaletteSelectionScreen(this));
    }

    key_START() {}

    key_A() {
        this.player.components.forEach(c => {
            if (c instanceof PlayerForm) {
                c.endAction();
            }
        })
    }

    keyDown_A() {
        this.player.components.forEach(c => {
            if (c instanceof PlayerForm) {
                c.startAction();
            }
        })
    }

    key_B() {
    }

    key_UP() {}
    key_DOWN() {}
    key_LEFT() {}
    key_RIGHT() {}

    update(dt: number) {
        if (!this.ready) {
            return;
        }

        super.update(dt);
    }

    render(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.save();
        ctx.translate(Math.floor(-this.camera.position.x), Math.floor(-this.camera.position.y));

        super.render(ctx, width, height);
        ctx.restore();

        this.ui.render(ctx);
    }
};
