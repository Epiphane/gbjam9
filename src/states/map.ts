import {
    State,
    Point,
    Entity,
} from "../../lib/juicy";
import { MapComponent } from "../components/map";
import { PaletteSelectionScreen } from "./palette-selector";

export class MapScreen extends State {
    constructor() {
        super();

        const mapEntity = new Entity(this, [MapComponent]);
        const map = mapEntity.get(MapComponent);

        map?.load('test');
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
