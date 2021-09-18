import { Component, Point, Game, TextInfo } from '../../lib/juicy';

type ClickCallback = (pos: Point) => any;

export class ButtonComponent extends Component {
    private callback: ClickCallback = () => {}
    private hovering = false;

    onClick(cb: ClickCallback) {
        this.callback = cb;
    }

    update(dt: number, game: typeof Game) {
        if (this.entity.contains(game.mouse)) {
            document.body.style.cursor = 'pointer';
            this.hovering = true;
        }
        else if (this.hovering) {
            document.body.style.cursor = 'default';
            this.hovering = false;
        }
    }

    mouseup(pos: Point) {
        if (this.entity.active) {
            this.callback(pos);
            document.body.style.cursor = 'default';
            this.hovering = false;
        }
    }
};
