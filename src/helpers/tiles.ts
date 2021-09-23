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
};

interface TileInfo {
    walkable: boolean;
    offset: Point;
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
        breaksInto: Tile.Wall1,
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
};