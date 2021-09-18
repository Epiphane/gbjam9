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
import { Keys } from "../helpers/constants";

export class MapScreen extends State {
    player: Entity;

    constructor() {
        super();

        const mapEntity = new Entity(this, 'map', [MapComponent]);
        mapEntity.get(MapComponent)?.load('test');

        this.player = new Entity(this, [SpriteComponent, Hitbox, PhysicsBody]);
        this.player.position.x = 46;
        this.player.position.y = 9 * 12;
        this.player.get(SpriteComponent)
            ?.setImage('./images/walk_boy.png')
            .setSize(16, 24)
            .runAnimation([0, 1, 2, 3], 0.15, true);

        const hitbox = this.player.get(Hitbox)!;
        hitbox.setOffset(4, 5);
        hitbox.setSize(6, 19);
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
        this.player.get(PhysicsBody)!.velocity.x = 0;
        this.player.get(PhysicsBody)!.velocity.y = 0;
        if (this.game.keyDown(Keys.UP)) {
            this.player.get(PhysicsBody)!.velocity.y = -48;
        }
        if (this.game.keyDown(Keys.DOWN)) {
            this.player.get(PhysicsBody)!.velocity.y = 48;
        }
        if (this.game.keyDown(Keys.LEFT)) {
            this.player.get(PhysicsBody)!.velocity.x = -48;
        }
        if (this.game.keyDown(Keys.RIGHT)) {
            this.player.get(PhysicsBody)!.velocity.x = 48;
        }

        super.update(dt);
    }
};
