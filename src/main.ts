import { Game, Sound } from '../lib/juicy';
import { ColorType, PaletteManager } from './helpers/palette';
import LoadingScreen from './states/loading';

const keys = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32,

    A: 65,
    D: 68,
    S: 83,
    W: 87,
};

const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const context = gameCanvas.getContext('2d');

Game.init({
    keys,
    width: 160,
    height: 144,
});

Game.afterRender((canvas: HTMLCanvasElement) => {
    gameCanvas.style.background = PaletteManager.getStyle(ColorType.Light);
    PaletteManager.applyPalette(canvas, gameCanvas);
});

// Document events
document.addEventListener('mousewheel', Game.trigger.bind(Game, 'mousewheel'));

window.onresize = () => Game.resize();

// Music
Sound.Load('FubSong', {
    src: './audio/FubSong.mp3',
    loop: true,
    volume: 0.01
});

// Sound.Play('FubSong');

Game.setState(new LoadingScreen()).run();

// Game.setDebug(document.getElementById("fps")!);
