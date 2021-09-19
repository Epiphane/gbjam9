import {
    State,
    Point,
    Entity,
    Game,
} from "../../lib/juicy";
import { Hitbox } from "../components/stupid-hitbox";
import { MapComponent } from "../components/map";
import { SpriteComponent } from "../components/sprite";
import { PaletteSelectionScreen } from "./palette-selector";
import { PlayerPhysics } from "../components/player-physics";
import { Keys } from "../helpers/constants";
import { Camera } from "../components/camera";

export class MapScreen extends State {
    player: Entity;
    camera: Entity;
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

        this.player = new Entity(this, [SpriteComponent, Hitbox, PlayerPhysics]);
        this.player.position.x = 46;
        this.player.position.y = 9 * 12;
        this.player.get(SpriteComponent)
            ?.setImage('./images/walk_boy.png')
            .setSize(16, 24)
            .runAnimation([0, 1, 2, 3], 0.15, true);

        const hitbox = this.player.get(Hitbox)!;
        hitbox.setOffset(4, 5);
        hitbox.setSize(6, 19);

        this.camera = new Entity(this, [Camera]);
        this.camera.get(Camera)?.follow(this.player);
    }

    init() {
    }

    key_SELECT() {
        this.game.setState(new PaletteSelectionScreen(this));
    }

    key_START() {}
    key_A() {}
    key_B() {}
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
    }
};
