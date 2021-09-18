import { Component } from "../../lib/juicy";
import { MapLoader, Tile, TileOffset } from "../helpers/map-loader";

const tiles = new Image();
tiles.src = './images/tiles.png';

const tileWidth = 16;
const tileHeight = 12;

export class MapComponent extends Component {
    tiles: Tile[][] = [];

    load(level: string) {
        MapLoader.load(`levels/${level}.tmx`)
            .then((data: Tile[][]) => this.tiles = data);
    }

    setSize(width: number, height: number) {
        this.tiles = new Array(height).fill(false).map(() => new Array(width).fill(Tile.None));
    }

    at(x: number, y: number) {
        return this.tiles[y][x];
    }

    set(x: number, y: number, tile: Tile) {
        this.tiles[y][x] = tile;
    }

    render(ctx: CanvasRenderingContext2D) {
        for (let y = 0; y < this.tiles.length; y ++) {
            for (let x = 0; x < this.tiles[y].length; x ++) {
                const tile = this.at(x, y);
                if (tile == Tile.None) {
                    continue;
                }

                ctx.drawImage(
                    tiles,
                    // source
                    TileOffset[tile].x * tileWidth,
                    TileOffset[tile].y * tileWidth,
                    tileWidth,
                    tileHeight,
                    // destination
                    x * tileWidth,
                    y * tileHeight,
                    tileWidth,
                    tileHeight
                );
            }
        }
    }
};