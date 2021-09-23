import { Component, Entity, Game, Point } from "../../lib/juicy";
import { EnemySpawner, LoadedMap, MapLoader, Spawner, Teleporter } from "../helpers/map-loader";
import { SaveManager } from "../helpers/save-manager";
import { Tile, TileInfo } from "../helpers/tiles";

const tiles = new Image();
tiles.src = './images/tiles.png';

const tileWidth = 16;
const tileHeight = 12;

export class MapComponent extends Component {
    name: string = '';
    tiles: Tile[][] = [];
    spawners: Spawner[] = [];
    teleporters: Teleporter[] = [];
    enemySpawners: EnemySpawner[] = [];

    private backdrop: Entity[] = [];

    load(level: string) {
        this.name = level;
        return MapLoader.load(`levels/${level}.tmx`)
            .then((data: LoadedMap) => {
                this.backdrop = [];
                this.tiles = data.tiles;
                this.spawners = data.spawners;
                this.teleporters = data.teleporters;
                this.enemySpawners = data.enemySpawners;
                this.entity.width = this.tiles[0]!.length * tileWidth;
                this.entity.height = this.tiles.length * tileHeight;

                const breaks = (SaveManager.get(`${this.name}_breaks`) ?? []) as Point[];
                breaks.forEach(pos => this.breakTile(pos.x, pos.y));

                return (this as MapComponent);
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

    breakTile(x: number, y: number) {
        if (x < 0 || y < 0 || y >= this.tiles.length || x >= this.tiles[0]!.length) {
            return;
        }

        const current = this.tiles[y]![x]!;
        const { breaksInto } = TileInfo[current];
        if (breaksInto) {
            const breaks = SaveManager.get(`${this.name}_breaks`) ?? [];
            breaks.push({x, y});
            SaveManager.set(`${this.name}_breaks`, breaks);

            this.tiles[y]![x]! = breaksInto;
        }
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
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y]!.length; x++) {
                const tile = this.tiles[y]![x]!;
                if (tile === Tile.None || !TileInfo[tile].background) {
                    continue;
                }

                this.drawTile(ctx, tile, x, y);
            }
        }

        this.backdrop.forEach(entity =>
            entity.render(ctx));

        // Then, foreground
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y]!.length; x++) {
                const tile = this.tiles[y]![x]!;
                if (tile == Tile.None || TileInfo[tile].background) {
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