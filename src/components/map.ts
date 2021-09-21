import { Component, Point } from "../../lib/juicy";
import { EnemySpawner, LoadedMap, MapLoader, Spawner, Teleporter } from "../helpers/map-loader";
import { Tile, TileInfo } from "../helpers/tiles";

const tiles = new Image();
tiles.src = './images/tiles.png';

const tileWidth = 16;
const tileHeight = 12;

export class MapComponent extends Component {
    tiles: Tile[][] = [];
    spawners: Spawner[] = [];
    teleporters: Teleporter[] = [];
    enemySpawners: EnemySpawner[] = [];

    load(level: string) {
        return MapLoader.load(`levels/${level}.tmx`)
            .then((data: LoadedMap) => {
                this.tiles = data.tiles;
                this.spawners = data.spawners;
                this.teleporters = data.teleporters;
                this.enemySpawners = data.enemySpawners;
                this.entity.width = this.tiles[0].length * tileWidth;
                this.entity.height = this.tiles.length * tileHeight;
                return this;
            });
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
        else if (typeof (y) === 'undefined') {
            throw `Only x coordinate was provied. Both x and y are needed`;
        }

        if (x < 0 || y < 0 || y >= this.tiles.length || x >= this.tiles[0].length) {
            return Tile.None;
        }

        return this.tiles[y][x];
    }

    render(ctx: CanvasRenderingContext2D) {
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y].length; x++) {
                const tile = this.tiles[y][x];
                if (tile == Tile.None) {
                    continue;
                }

                ctx.drawImage(
                    tiles,
                    // source
                    TileInfo[tile].offset.x * tileWidth,
                    TileInfo[tile].offset.y * tileHeight,
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