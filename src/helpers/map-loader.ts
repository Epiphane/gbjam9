import { Game, Point } from '../../lib/juicy';

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

export const TileOffset: { [key: number]: Point } = {
    [Tile.Brick1]: new Point(1, 0),
    [Tile.Brick2]: new Point(2, 0),
    [Tile.Wall1]: new Point(1, 1),
    [Tile.Wall2]: new Point(2, 1),
    [Tile.Wall3]: new Point(1, 2),
    [Tile.Wall4]: new Point(2, 2),
    [Tile.Dark]: new Point(0, 1),
    [Tile.Low]: new Point(0, 2),
    [Tile.Mid]: new Point(0, 3),
    [Tile.Light]: new Point(0, 4),
};

const TilesetToTile = (value: number) => {
    const tiles = Object.keys(TileOffset);
    for (let i = 0; i < tiles.length; i++) {
        const key = parseInt(tiles[i]);
        if (!isNaN(key)) {
            const offset = TileOffset[key];
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
    source?: string;
    action: SpawnerAction;
}

export interface Teleporter {
    position: Point;
    size: Point;
    destination: string;
}

export interface LoadedMap {
    tiles: Tile[][];
    spawners: Spawner[];
    teleporters: Teleporter[];
}

class MapLoader {
    load(source: string): Promise<LoadedMap> {
        return fetch(source)
            .then(data => data.text())
            .then(data => this.parseXML(data))
            .then((data: LevelData) => this.parseMap(data));
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
            const child = node.children[index];
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
            const child = node.children[index];
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
            const child = node.children[index];
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
            const child = node.children[index];
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
            const child = dom.documentElement.children[index];
            if (!child.nodeName) {
                continue;
            }

            if (child.nodeName === 'layer') {
                tileLayers.push(this.parseLayer(child));
            }
            else if (child.nodeName === 'objectgroup') {
                objectGroups.push(this.parseGroup(child));
            }
            else if (['tileset', 'editorsettings'].indexOf(child.nodeName) >= 0) {
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

    parseMap(data: LevelData): LoadedMap {
        const result: LoadedMap = {
            tiles: new Array(data.height).fill(false).map(() => new Array(data.width).fill(Tile.None)),
            spawners: [],
            teleporters: [],
        };

        data.tileLayers.forEach(layer => {
            layer.data.forEach((value, i) => {
                const row = Math.floor(i / layer.width);
                const col = i % layer.width;
                const x = layer.x + col;
                const y = layer.y + row;

                result.tiles[y][x] = TilesetToTile(value);
            });
        });

        data.objectGroups.forEach(group => {
            if (group.name === 'Spawners') {
                result.spawners = group.objects.map(obj => {
                    const position = obj.position;
                    const source = obj.properties['source']
                    let action = SpawnerAction.None;

                    if (obj.properties['dir'] === 'right') {
                        action = SpawnerAction.WalkRight;
                    }
                    else if (obj.properties['dir'] === 'left') {
                        action = SpawnerAction.WalkLeft;
                    }

                    return {
                        position,
                        source,
                        action,
                    };
                });
            }
            else if (group.name === 'Teleporters') {
                result.teleporters = group.objects.map(obj => {
                    const { position, size } = obj;
                    return {
                        position,
                        size,
                        destination: obj.properties['destination'],
                    };
                });
            }
        })

        return result;
    }
};

const loader = Game.singleton('MapLoader', MapLoader);
export { loader as MapLoader };