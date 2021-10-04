import { Game, State, Entity } from "../../lib/juicy";
import { CoolText, FontFace } from "../components/cool-text";
import { SpriteComponent } from "../components/sprite";
import { ColorType } from "../helpers/palette";
import { SaveManager } from "../helpers/save-manager";

export class GameOverScreen extends State {
    constructor() {
        super();

        const bg = new Entity(this);
        bg.add(SpriteComponent)
            .setSize(160, 144)
            .setImage("./images/credits.png");
    }

    init() {
        SaveManager.clear()
    }
}