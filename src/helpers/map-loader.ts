import { Game, Point } from '../../lib/juicy';
import { Tile, TileInfo } from './tiles';

const TilesetToTile = (value: number) => {
    for (const keyStr in Tile) {
        const key = parseInt(keyStr);
        if (!isNaN(key)) {
            const offset = TileInfo[key as Tile].offset;
            const val = 1 + offset.y * 10 + offset.x;
            if (value === val) {
                return key;
            }
        }
    }

    return Tile.None;
};

interface TileLayer {
    id: number;
    name: string;
    visible: boolean;
    x: number;
    y: number;
    height: number;
    width: number;
    data: number[];
};

interface Tileset {
    source: string;
}

interface Object {
    name: string;
    position: Point;
    size: Point;
    properties: { [key: string]: any };
};

interface ObjectGroup {
    name: string;
    objects: Object[];
};

interface LevelData {
    height: number;
    width: number;
    infinite: boolean;
    objectGroups: ObjectGroup[];
    tileLayers: TileLayer[];
    tileheight: number;
    tilewidth: number;
    tilesets: Tileset[];
};

export enum SpawnerAction {
    None,
    WalkLeft,
    WalkRight,
};

export interface Spawner {
    position: Point;
    size: Point;
    source?: string;
    action: SpawnerAction;
}

export enum TeleporterType {
    Normal,
    Door,
}

export interface Teleporter {
    position: Point;
    size: Point;
    destination: string;
    type: TeleporterType;
}

export interface EnemySpawner {
    position: Point;
    enemyType: string;
}

export interface LoadedMap {
    tiles: Tile[][];
    spawners: Spawner[];
    teleporters: Teleporter[];
    enemySpawners: EnemySpawner[];
}

const mapCache: { [key: string]: LoadedMap } = {};

class MapLoader {
    load(source: string): Promise<LoadedMap> {
        if (mapCache[source]) {
            return Promise.resolve(mapCache[source]!);
        }

        return fetch(source)
            .then(data => data.text())
            .then(data => this.parseXML(data))
            .then((data: LevelData) => this.parseMap(data))
            .then((data: LoadedMap) => mapCache[source] = data);
    }

    parseLayer(node: Element): TileLayer {
        const id = parseInt(node.getAttribute('id')!) || 0;
        const name = node.getAttribute('name') || '';
        const visible = node.getAttribute('infinite') !== '0';
        const width = parseInt(node.getAttribute('width')!) || 0;
        const height = parseInt(node.getAttribute('height')!) || 0;
        const x = parseInt(node.getAttribute('x')!) || 0;
        const y = parseInt(node.getAttribute('y')!) || 0;

        let data: number[] = [];
        for (const index in node.children) {
            const child = node.children[index]!;
            if (child.nodeName === 'data') {
                const encoding = child.getAttribute('encoding');
                if (encoding === 'csv') {
                    data = (child.textContent || '').replace(/\n/g, '').split(',').map(i => parseInt(i));
                }
                else {
                    throw `I don't know how to parse ${encoding} yet you dirty dog, use CSV!`
                }
            }
        }

        return {
            id,
            name,
            visible,
            x,
            y,
            height,
            width,
            data,
        };
    }

    parseProperties(node: Element): { [key: string]: any } {
        const properties: { [key: string]: any } = {};

        for (const index in node.children) {
            const child = node.children[index]!;
            if (child.nodeName === 'property') {
                const name = child.getAttribute('name') || '';
                const type = child.getAttribute('type') || 'string';
                let value: any = child.getAttribute('value') || '';

                if (type === 'int') {
                    value = parseInt(value);
                }
                else if (type === 'bool') {
                    value = value === 'true';
                }
                else if (type === 'float') {
                    value = parseFloat(value);
                }

                properties[name] = value;
            }
        }

        return properties;
    }

    parseObject(node: Element): Object {
        const name = node.getAttribute('name') || '';
        const position = new Point(
            parseInt(node.getAttribute("x") || `0`),
            parseInt(node.getAttribute("y") || `0`),
        );
        const size = new Point(
            parseInt(node.getAttribute("width") || `0`),
            parseInt(node.getAttribute("height") || `0`),
        );
        let properties = {};

        for (const index in node.children) {
            const child = node.children[index]!;
            if (child.nodeName === 'properties') {
                properties = this.parseProperties(child);
            }
        }

        return {
            name,
            position,
            size,
            properties,
        };
    }

    parseGroup(node: Element): ObjectGroup {
        const name = node.getAttribute('name') || '';
        const objects: Object[] = [];

        for (const index in node.children) {
            const child = node.children[index]!;
            if (child.nodeName === 'object') {
                objects.push(this.parseObject(child));
            }
        }

        return { name, objects };
    }

    parseXML(data: string): LevelData {
        const result: LevelData = {
            height: 0,
            width: 0,
            infinite: false,
            objectGroups: [],
            tileLayers: [],
            tileheight: 0,
            tilewidth: 0,
            tilesets: [],
        };

        const parser = new DOMParser();
        const dom = parser.parseFromString(data, 'application/xml');
        if (dom.documentElement.nodeName == "parsererror") {
            throw 'error while parsing';
        }

        const width = parseInt(dom.documentElement.getAttribute('width')!) || 0;
        const height = parseInt(dom.documentElement.getAttribute('height')!) || 0;
        const infinite = dom.documentElement.getAttribute('infinite') === '1';
        const tilewidth = parseInt(dom.documentElement.getAttribute('tilewidth')!) || 0;
        const tileheight = parseInt(dom.documentElement.getAttribute('tileheight')!) || 0;

        const objectGroups: ObjectGroup[] = [];
        const tileLayers: TileLayer[] = [];
        const tilesets: Tileset[] = [];
        for (const index in dom.documentElement.children) {
            const child = dom.documentElement.children[index]!;
            if (!child.nodeName) {
                continue;
            }

            if (child.nodeName === 'layer') {
                tileLayers.push(this.parseLayer(child));
            }
            else if (child.nodeName === 'objectgroup') {
                objectGroups.push(this.parseGroup(child));
            }
            else if (['imagelayer', 'tileset', 'editorsettings'].indexOf(child.nodeName) >= 0) {
                // who cares, I don't
            }
            else {
                console.warn(`idk what a ${child.nodeName} is`);
            }
        }

        return {
            height,
            width,
            infinite,
            objectGroups,
            tileLayers,
            tileheight,
            tilewidth,
            tilesets,
        };
    }

    makeSpawner(obj: Object): Spawner {
        const { position, size, properties: { source, dir } } = obj;
        let action = SpawnerAction.None;

        if (dir === 'right') {
            action = SpawnerAction.WalkRight;
        }
        else if (dir === 'left') {
            action = SpawnerAction.WalkLeft;
        }

        return {
            position,
            size,
            source,
            action,
        };
    }

    makeTeleporter(obj: Object): Teleporter {
        const { position, size, properties: { type, destination } } = obj;
        return {
            position,
            size,
            destination,
            type: (TeleporterType[type] as any as TeleporterType) || TeleporterType.Normal
        };
    }

    parseMap(data: LevelData): LoadedMap {
        const result: LoadedMap = {
            tiles: new Array(data.height).fill(false).map(() => new Array(data.width).fill(Tile.None)),
            spawners: [],
            teleporters: [],
            enemySpawners: [],
        };

        data.tileLayers.forEach(layer => {
            layer.data.forEach((value, i) => {
                const row = Math.floor(i / layer.width);
                const col = i % layer.width;
                const x = layer.x + col;
                const y = layer.y + row;

                result.tiles[y]![x] = TilesetToTile(value);
            });
        });

        data.objectGroups.forEach(group => {
            if (group.name === 'Spawners') {
                group.objects.forEach(obj => {
                    result.spawners.push(this.makeSpawner(obj));
                    if (obj.properties.twoWay) {
                        obj.properties.destination = obj.properties.source;
                        result.teleporters.push(this.makeTeleporter(obj));
                    }
                });
            }
            else if (group.name === 'Teleporters') {
                group.objects.forEach(obj => {
                    result.teleporters.push(this.makeTeleporter(obj));
                    if (obj.properties.twoWay) {
                        obj.properties.source = obj.properties.destination;
                        result.spawners.push(this.makeSpawner(obj));
                    }
                });
            }
            else if (group.name === "EnemySpawner") {
                result.enemySpawners = group.objects.map(obj => {
                    const { position } = obj;
                    return {
                        position,
                        enemyType: obj.properties['EnemyType'],
                    }
                })
            }
        })

        return result;
    }
};

const loader = Game.singleton(MapLoader);
export { loader as MapLoader };