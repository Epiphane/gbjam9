import {
    State,
    Point,
    Entity,
} from "../../lib/juicy";
import { MapComponent } from "../components/map";
import { SpriteComponent } from "../components/sprite";
import { PaletteSelectionScreen } from "./palette-selector";

export class MapScreen extends State {
    constructor() {
        super();

        const mapEntity = new Entity(this, [MapComponent]);
        mapEntity.get(MapComponent)?.load('test');

        const player = new Entity(this, [SpriteComponent]);
        player.position.x = 16;
        player.position.y = 9 * 12;
        player.get(SpriteComponent)
            ?.setImage('./images/idle_boy.png')
            .setSize(16, 24)
            .runAnimation([0, 1, 2, 3], 0.5, true);
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
    }
};
