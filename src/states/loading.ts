import {
    Entity,
    Game,
    State,
    TextComponent,
} from "../../lib/juicy";
import { GameScreen } from "./game";

export class LoadingScreen extends State {
    text: TextComponent;

    constructor() {
        super();

        const text = new Entity(this);
        this.text = text.add(TextComponent);
        this.text.set({
            text: 'Loading...',
            fillStyle: 'black',
            size: 32,
            font: 'Poiret One'
        }).then(() => {
            text.position.x = (Game.size.x - text.width) / 2;
            text.position.y = 20;
        });
    }

    update(dt: number) {
        this.game.setState(new GameScreen());
    }
};
