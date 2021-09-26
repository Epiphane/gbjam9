import { Point } from "../../lib/juicy";

export enum Tile {
    None,
    Brick1,
    Brick2,
    BreakableBrick,
    Wall1,
    Wall2,
    Wall3,
    Wall4,
    Dark,
    Low,
    Mid,
    Light,
    WaterTop1,
    WaterTop2,
    Water1,
    Water2,
    Water3,
    Water4,
};

interface TileInfo {
    walkable: boolean;
    mustSwim?: boolean;
    offset: Point;
    offsetAnim?: Point[];
    offsetAnimTime?: number;
    background?: boolean;
    breaksInto?: Tile;
}

export const TileInfo: { [key in Tile]: TileInfo } = {
    [Tile.None]: {
        walkable: true,
        offset: new Point(0, 0),
        background: true,
    },
    [Tile.Brick1]: {
        walkable: false,
        offset: new Point(1, 0),
    },
    [Tile.Brick2]: {
        walkable: false,
        offset: new Point(2, 0),
    },
    [Tile.BreakableBrick]: {
        walkable: false,
        offset: new Point(3, 0),
        breaksInto: Tile.Mid,
    },
    [Tile.Wall1]: {
        walkable: true,
        offset: new Point(1, 1),
        background: true,
    },
    [Tile.Wall2]: {
        walkable: true,
        offset: new Point(2, 1),
        background: true,
    },
    [Tile.Wall3]: {
        walkable: true,
        offset: new Point(1, 2),
        background: true,
    },
    [Tile.Wall4]: {
        walkable: true,
        offset: new Point(2, 2),
        background: true,
    },
    [Tile.Dark]: {
        walkable: true,
        offset: new Point(0, 1),
        background: true,
    },
    [Tile.Low]: {
        walkable: true,
        offset: new Point(0, 2),
        background: true,
    },
    [Tile.Mid]: {
        walkable: true,
        offset: new Point(0, 3),
        background: true,
    },
    [Tile.Light]: {
        walkable: true,
        offset: new Point(0, 4),
        background: true,
    },
    [Tile.WaterTop1]: {
        walkable: true,
        mustSwim: true,
        offset: new Point(3, 1),
        offsetAnim: [new Point(5, 1)],
        background: true,
    },
    [Tile.WaterTop2]: {
        walkable: true,
        mustSwim: true,
        offset: new Point(4, 1),
        offsetAnim: [new Point(6, 1)],
        background: true,
    },
    [Tile.Water1]: {
        walkable: true,
        mustSwim: true,
        offset: new Point(3, 2),
        offsetAnim: [new Point(5, 2)],
        background: true,
    },
    [Tile.Water2]: {
        walkable: true,
        mustSwim: true,
        offset: new Point(4, 2),
        offsetAnim: [new Point(6, 2)],
        background: true,
    },
    [Tile.Water3]: {
        walkable: true,
        mustSwim: true,
        offset: new Point(3, 3),
        background: true,
    },
    [Tile.Water4]: {
        walkable: true,
        mustSwim: true,
        offset: new Point(4, 3),
        background: true,
    },
};