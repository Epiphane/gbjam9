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
import { VaniaScreen } from "./vania";

export class TestScreen extends VaniaScreen {
    constructor() {
        super();

        this.loadLevel('test');
    }
};
