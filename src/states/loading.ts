import {
    BoxComponent,
    Entity,
    Game,
    ImageComponent,
    State,
    TextComponent,
} from "../../lib/juicy";

export default class LoadingScreen extends State {
    text: TextComponent;

    constructor() {
        super();

        const rect = new Entity(this);
        const box = rect.add(BoxComponent);
        box.fillStyle = 'blue';
        box.entity.width = 158;
        box.entity.height = 142;
        box.entity.position.x = 1;
        box.entity.position.y = 1;

        const ppl = new Entity(this, 'player', [ImageComponent]);
        ppl.get(ImageComponent)?.setImage('./images/player.png');

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
            ppl.position.y = text.position.y + text.height;
        });
    }

    init() {
    }

    update(dt: number) {
        super.update(dt);
    }
};
