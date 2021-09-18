import { Component, Point } from "../../lib/juicy";
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

    getTileCoords(worldCoords: Point) {
        let { x, y } = worldCoords;
        x = Math.floor(x / tileWidth);
        y = Math.floor(y / tileHeight);

        return new Point(x, y);
    }

    getTile(x: number | Point, y?: number) {
        if (x instanceof Point) {
            y = x.y;
            x = x.x;
        }
        else if (typeof(y) === 'undefined') {
            throw `Only x coordinate was provied. Both x and y are needed`;
        }

        if (x < 0 || y < 0 || y >= this.tiles.length || x >= this.tiles[0].length) {
            return Tile.None;
        }

        return this.tiles[y][x];
    }

    render(ctx: CanvasRenderingContext2D) {
        for (let y = 0; y < this.tiles.length; y ++) {
            for (let x = 0; x < this.tiles[y].length; x ++) {
                const tile = this.tiles[y][x];
                if (tile == Tile.None) {
                    continue;
                }

                ctx.drawImage(
                    tiles,
                    // source
                    TileOffset[tile].x * tileWidth,
                    TileOffset[tile].y * tileHeight,
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