import { Game, Sound } from '../lib/juicy';
import { PaletteManager } from './helpers/palette';
import { LoadingScreen } from './states/loading';
import { Keys } from './helpers/constants';
import { TestScreen } from './states/test';
import { __DEV__, __PALETTE__, __TEST_LEVEL__ } from './helpers/debug';
import { GameOverScreen } from './states/game-over';

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

export { keys as KeyCodes };

const gameCanvas = document.getElementById('game-canvas') as HTMLCanvasElement;

// Scale up the canvas to be as big as possible
const mobileCheck = () => {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||(window as any).opera);
    return check;
};

export let ISMOBILE = mobileCheck();
if (ISMOBILE) {
    document.body.classList.add('mobile');
    setTimeout(() => window.onresize?.({} as UIEvent));
}
else {
    document.body.classList.add('desktop');
    setTimeout(() => window.onresize?.({} as UIEvent));
}

Game.init({
    keys,
    width: 160,
    height: 144,
});

Game.afterRender((canvas: HTMLCanvasElement) => {
    if (__PALETTE__) {
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

document.body.appendChild(document.createElement('br'));


// Document events
document.addEventListener('mousewheel', Game.trigger.bind(Game, 'mousewheel'));

window.onresize = () => {
    const maxScaleW = Math.floor(gameCanvas.parentElement!.clientWidth / 160);
    const maxScaleH = Math.floor(gameCanvas.parentElement!.clientHeight / 144);
    const scale = Math.min(maxScaleH, maxScaleW);
    gameCanvas.style.width = `${160 * scale}px`;
    gameCanvas.style.height = `${144 * scale}px`;
    Game.resize();
}

// Music
Sound.Load('BGM', {
    src: './audio/bgm.mp3',
    isSFX: false,
    loop: true,
    volume: 0.10
});

Sound.Play('BGM');

if (__TEST_LEVEL__) {
    Game.setState(new TestScreen()).run();
}
else {
    Game.setState(new LoadingScreen()).run();
}

const IDToButton: { [key: string]: Keys } = {
    'gameboy-a': Keys.A,
    'gameboy-b': Keys.B,
    'gameboy-up': Keys.UP,
    'gameboy-down': Keys.DOWN,
    'gameboy-right': Keys.RIGHT,
    'gameboy-left': Keys.LEFT,
    'gameboy-start': Keys.START,
    'gameboy-select': Keys.SELECT,
}

let touchin : Keys | undefined;
const SetupButton = (button: HTMLElement, key: Keys) => {
    if (ISMOBILE) {
        button.addEventListener('touchstart', () => {
            document.onkeydown!(new KeyboardEvent('keydown', {
                keyCode: keys[key],
            }))
            const c = button.firstChild as HTMLElement;
            c.style.borderColor = 'rgba(52, 104, 86, 255)';
        });
        button.addEventListener('touchmove', (event) => {
            document.onkeydown!(new KeyboardEvent('keydown', {
                keyCode: keys[key],
            }))
            const c = button.firstChild as HTMLElement;
            c.style.borderColor = 'rgba(52, 104, 86, 255)';
            const changedTouch = event.changedTouches[0]!;
            const element = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY)
            const newTouchin = element ? IDToButton[element.id] : undefined;
            if (newTouchin !== touchin && newTouchin !== key) {
                if (touchin) {
                    document.onkeyup!(new KeyboardEvent('keyup', {
                        keyCode: keys[touchin],
                    }))
                }
                touchin = newTouchin;
                if (touchin) {
                    document.onkeydown!(new KeyboardEvent('keydown', {
                        keyCode: keys[touchin],
                    }))
                }
            }
        })
        button.addEventListener('touchend', () => {
            document.onkeyup!(new KeyboardEvent('keyup', {
                keyCode: keys[key],
            }))
            const c = button.firstChild as HTMLElement;
            c.style.borderColor = 'rgba(8, 24, 32, 255)';
        })
    }
    else {
        button.addEventListener('mousedown', () => {
            document.onkeydown!(new KeyboardEvent('keydown', {
                keyCode: keys[key],
            }))
            const c = button.firstChild as HTMLElement;
            c.style.borderColor = 'rgba(52, 104, 86, 255)';
        });
        button.addEventListener('mouseup', () => {
            document.onkeyup!(new KeyboardEvent('keyup', {
                keyCode: keys[key],
            }))
            const c = button.firstChild as HTMLElement;
            c.style.borderColor = 'rgba(8, 24, 32, 255)';
        })
    }
}

SetupButton(document.getElementById('gameboy-a')!, Keys.A);
SetupButton(document.getElementById('gameboy-b')!, Keys.B);
SetupButton(document.getElementById('gameboy-up')!, Keys.UP);
SetupButton(document.getElementById('gameboy-down')!, Keys.DOWN);
SetupButton(document.getElementById('gameboy-right')!, Keys.RIGHT);
SetupButton(document.getElementById('gameboy-left')!, Keys.LEFT);
SetupButton(document.getElementById('gameboy-start')!, Keys.START);
SetupButton(document.getElementById('gameboy-select')!, Keys.SELECT);
