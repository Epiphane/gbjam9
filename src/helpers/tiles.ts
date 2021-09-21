import { Point } from "../../lib/juicy";

export enum Tile {
    None,
    Brick1,
    Brick2,
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
}

export const TileInfo: { [key in Tile]: TileInfo } = {
    [Tile.None]: {
        walkable: true,
        offset: new Point(0, 0),
    },
    [Tile.Brick1]: {
        walkable: false,
        offset: new Point(1, 0),
    },
    [Tile.Brick2]: {
        walkable: false,
        offset: new Point(2, 0),
    },
    [Tile.Wall1]: {
        walkable: true,
        offset: new Point(1, 1),
    },
    [Tile.Wall2]: {
        walkable: true,
        offset: new Point(2, 1),
    },
    [Tile.Wall3]: {
        walkable: true,
        offset: new Point(1, 2),
    },
    [Tile.Wall4]: {
        walkable: true,
        offset: new Point(2, 2),
    },
    [Tile.Dark]: {
        walkable: true,
        offset: new Point(0, 1),
    },
    [Tile.Low]: {
        walkable: true,
        offset: new Point(0, 2),
    },
    [Tile.Mid]: {
        walkable: true,
        offset: new Point(0, 3),
    },
    [Tile.Light]: {
        walkable: true,
        offset: new Point(0, 4),
    },
};