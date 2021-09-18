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
import { PhysicsBody } from "../components/physics";

export class MapScreen extends State {
    player: Entity;

    constructor() {
        super();

        const mapEntity = new Entity(this, 'map', [MapComponent]);
        mapEntity.get(MapComponent)?.load('test');

        this.player = new Entity(this, [SpriteComponent, Hitbox, PhysicsBody]);
        this.player.position.x = 16;
        this.player.position.y = 9 * 12;
        this.player.get(SpriteComponent)
            ?.setImage('./images/walk_boy.png')
            .setSize(16, 24)
            .runAnimation([0, 1, 2, 3], 0.15, true);

        const hitbox = this.player.get(Hitbox)!;
        hitbox.setOffset(4, 4);
        hitbox.setSize(7, 20);

        const physics = this.player.get(PhysicsBody)!;
        physics.velocity.x = 48;
        // hitbox.visible = true;
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
        super.update(dt);

        if (this.player.position.x > 128) {
            const physics = this.player.get(PhysicsBody)!;
            physics.velocity.x = -48;

            this.player.get(SpriteComponent)!.flip = true;
        }

        if (this.player.position.x < 16) {
            const physics = this.player.get(PhysicsBody)!;
            physics.velocity.x = 48;

            this.player.get(SpriteComponent)!.flip = false;
        }
    }
};
