import { Game, Sound } from '../lib/juicy';
import { ColorType, DarkColor, LightColor, PaletteManager } from './helpers/palette';
import { LoadingScreen } from './states/loading';
import { Keys } from './helpers/constants';

// const keys = {
//     LEFT: 37,
//     UP: 38,
//     RIGHT: 39,
//     DOWN: 40,
//     SPACE: 32,

//     A: 65,
//     D: 68,
//     S: 83,
//     W: 87,
// };
const keys = {
    [Keys.LEFT]: 37,
    [Keys.UP]: 38,
    [Keys.RIGHT]: 39,
    [Keys.DOWN]: 40,
    [Keys.A]: 90,
    [Keys.B]: 88,
    [Keys.START]: 13,
    [Keys.SELECT]: 8,
};

const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;

// Scale up the canvas to be as big as possible
const maxScaleW = Math.floor(gameCanvas.parentElement!.clientWidth / 160);
const maxScaleH = Math.floor(gameCanvas.parentElement!.clientHeight / 144);
const scale = Math.min(maxScaleH, maxScaleW);
gameCanvas.style.width = `${160 * scale}px`;
gameCanvas.style.height = `${144 * scale}px`;

Game.init({
    keys,
    width: 160,
    height: 144,
});

Game.afterRender((canvas: HTMLCanvasElement) => {
    if (applyPalette) {
        const ctx = gameCanvas.getContext('2d')!;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 160, 144);
        PaletteManager.applyPalette(canvas, gameCanvas);
    }
    else {
        const ctx = gameCanvas.getContext('2d')!;
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 160, 144);
        ctx.drawImage(canvas, 0, 0);
    }
});

let applyPalette = true;
const paletteButton = document.createElement('button');
paletteButton.textContent = 'Turn off Palette';
paletteButton.onclick = () => {
    applyPalette = !applyPalette;
    paletteButton.textContent = applyPalette ? 'Turn off Palette' : 'Turn on Palette';
};
document.body.appendChild(document.createElement('br'));
document.body.appendChild(paletteButton);

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
