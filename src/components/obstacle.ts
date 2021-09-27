import { Component } from "../../lib/juicy";

export enum Direction {
    Up = 'Up',
    Down = 'Down',
    Left = 'Left',
    Right = 'Right',
}

export class Obstacle extends Component {
    blockDirections: { [key in Direction]: boolean } = {
        Up: true,
        Down: true,
        Left: true,
        Right: true,
    }

    isAFunnyBouncyBoy = false;

    canPass(direction: Direction) {
        return !this.blockDirections[direction];
    }
}