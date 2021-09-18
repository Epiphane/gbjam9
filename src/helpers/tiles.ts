import { Tile } from "./map-loader";

interface TileInfo {
    walkable: boolean;
}

export const TileInfo: { [key in Tile]: TileInfo } = {
    [Tile.None]: {
        walkable: true,
    },
    [Tile.Brick1]: {
        walkable: false,
    },
    [Tile.Brick2]: {
        walkable: false,
    },
    [Tile.Wall1]: {
        walkable: true,
    },
    [Tile.Wall2]: {
        walkable: true,
    },
    [Tile.Wall3]: {
        walkable: true,
    },
    [Tile.Wall4]: {
        walkable: true,
    },
    [Tile.Dark]: {
        walkable: true,
    },
    [Tile.Low]: {
        walkable: true,
    },
    [Tile.Mid]: {
        walkable: true,
    },
    [Tile.Light]: {
        walkable: true,
    },
};