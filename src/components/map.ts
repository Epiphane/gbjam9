import { Component, Entity, Game, Point } from "../../lib/juicy";
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

    private backdrop: Entity[] = [];

    load(level: string) {
        return MapLoader.load(`levels/${level}.tmx`)
            .then((data: LoadedMap) => {
                this.backdrop = [];
                this.tiles = data.tiles;
                this.spawners = data.spawners;
                this.teleporters = data.teleporters;
                this.enemySpawners = data.enemySpawners;
                this.entity.width = this.tiles[0]!.length * tileWidth;
                this.entity.height = this.tiles.length * tileHeight;
                return this;
            });
    }

    setSize(width: number, height: number) {
        this.tiles = new Array(height).fill(false).map(() => new Array(width).fill(Tile.None));
    }

    addToBackground(e: Entity) {
        e.state.remove(e);
        this.backdrop.push(e);
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

        if (x < 0 || y < 0 || y >= this.tiles.length || x >= this.tiles[0]!.length) {
            return Tile.None;
        }

        return this.tiles[y]![x]!;
    }

    drawTile(ctx: CanvasRenderingContext2D, tile: Tile, x: number, y: number) {
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

    update(dt: number, game: typeof Game) {
        super.update(dt, game);

        this.backdrop.forEach(e => e.update(dt));
    }

    render(ctx: CanvasRenderingContext2D) {
        // First, background pass
        this.tiles.forEach((tileRow, y) => {
            tileRow.forEach((tile, x) => {
                if (tile === Tile.None || !TileInfo[tile].background) {
                    return;
                }

                this.drawTile(ctx, tile, x, y);
            });
        });

        this.backdrop.forEach(entity =>
            entity.render(ctx));

        this.tiles.forEach((tileRow, y) => {
            tileRow.forEach((tile, x) => {
                if (tile === Tile.None || !TileInfo[tile].background) {
                    return;
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
            });
        });
    }
};