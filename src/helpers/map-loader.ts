import { Game, Point } from '../../lib/juicy';

export enum Tile {
    None,
    Brick1,
    Brick2,
};

export const TileOffset: { [key: number]: Point } = {
    [Tile.Brick1]: new Point(1, 0),
    [Tile.Brick2]: new Point(2, 0),
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

interface LevelLayer {
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

interface LevelData {
    height: number;
    width: number;
    infinite: boolean;
    layers: LevelLayer[];
    tileheight: number;
    tilewidth: number;
    tilesets: Tileset[];
};

class MapLoader {
    load(source: string): Promise<Tile[][]> {
        return fetch(source)
            .then(data => data.text())
            .then(data => this.parseXML(data))
            .then((data: LevelData) => this.parseMap(data));
    }

    parseLayer(node: Element): LevelLayer {
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

    parseXML(data: string): LevelData {
        const result: LevelData = {
            height: 0,
            width: 0,
            infinite: false,
            layers: [],
            tileheight: 0,
            tilewidth: 0,
            tilesets: [],
        };

        const parser = new DOMParser();
        const dom = parser.parseFromString(data, 'application/xml');
        console.log(dom);

        if (dom.documentElement.nodeName == "parsererror") {
            throw 'error while parsing';
        }

        const width = parseInt(dom.documentElement.getAttribute('width')!) || 0;
        const height = parseInt(dom.documentElement.getAttribute('height')!) || 0;
        const infinite = dom.documentElement.getAttribute('infinite') === '1';
        const tilewidth = parseInt(dom.documentElement.getAttribute('tilewidth')!) || 0;
        const tileheight = parseInt(dom.documentElement.getAttribute('tileheight')!) || 0;

        const layers: LevelLayer[] = [];
        const tilesets: Tileset[] = [];
        for (const index in dom.documentElement.children) {
            const child = dom.documentElement.children[index];

            if (child.nodeName === 'layer') {
                layers.push(this.parseLayer(child));
            }
            else if (child.nodeName === 'tileset') {

            }
        }

        return {
            height,
            width,
            infinite,
            layers,
            tileheight,
            tilewidth,
            tilesets,
        };
    }

    parseMap(data: LevelData): Tile[][] {
        const tiles = new Array(data.height).fill(false).map(() => new Array(data.width).fill(Tile.None));

        data.layers.forEach(layer => {
            layer.data.forEach((value, i) => {
                const row = Math.floor(i / layer.width);
                const col = i % layer.width;
                const x = layer.x + col;
                const y = layer.y + row;

                tiles[y][x] = TilesetToTile(value);
            });
        });

        return tiles;
    }
};

const loader = Game.singleton('MapLoader', MapLoader);
export { loader as MapLoader };