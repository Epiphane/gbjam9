import { Game, Sound } from "../../lib/juicy";
import { Hitbox } from "../components/stupid-hitbox";
import { LoadingScreen } from "../states/loading";
import { TestScreen } from "../states/test";
import { Keys } from "./constants";
import { SaveManager } from "./save-manager";
import { KeyCodes } from "../main";

const debugElement = document.createElement('div');
document.body.appendChild(debugElement);

class Button {
    content: () => string;
    el = document.createElement('button');

    constructor({ content, onclick, parent }: {
        content: () => string,
        onclick?: () => void,
        parent?: HTMLDivElement,
    }) {
        this.content = content;
        this.el.textContent = this.content();
        this.el.onclick = () => {
            onclick?.();
            this.el.textContent = this.content();
        };
        (parent ?? debugElement).appendChild(this.el);
    }
}

// Dev mode
export const __DEV__ = localStorage.getItem('__DEV__') === 'on';
if (__DEV__) {
    const fps = document.createElement('span');
    Game.setDebug(fps);
    debugElement.appendChild(fps);
}

new Button({
    content: () => __DEV__ ? 'Turn off DevMode (reloads page)' : 'Turn on DevMode (reloads page)',
    onclick: () => {
        localStorage.setItem('__DEV__', !__DEV__ ? 'on' : 'off');
        location.reload();
    }
});

new Button({
    content: () => 'Mute Music',
    onclick: () => {
        Sound.MuteMusic();
    }
});

new Button({
    content: () => 'Mute SFX',
    onclick: () => {
        Sound.MuteSfx();
    }
});

// Apply palette
export let __PALETTE__ = true;
if (__DEV__) {
    __PALETTE__ = localStorage.getItem('__PALETTE__') !== 'off';
    new Button({
        content: () => __PALETTE__ ? 'Turn off Palette' : 'Turn on Palette',
        onclick: () => {
            __PALETTE__ = !__PALETTE__;
            localStorage.setItem('__PALETTE__', __PALETTE__ ? 'on' : 'off');
        }
    });
}

// Show hitboxes
export let __HITBOXES__ = false;
if (__DEV__) {
    __HITBOXES__ = localStorage.getItem('__HITBOXES__') !== 'off';
    new Button({
        content: () => __HITBOXES__ ? 'Hide hitboxes' : 'Show hitboxes',
        onclick: () => {
            __HITBOXES__ = !__HITBOXES__;
            localStorage.setItem('__HITBOXES__', __HITBOXES__ ? 'on' : 'off');

            Game.getState().entities.forEach(e =>
                e.get(Hitbox)?.setVisible(__HITBOXES__));
        }
    });
}

// Skip palette/controls
export let __SKIP_CONTROLS__ = false;
export let __SKIP_PALETTE__ = false;
if (__DEV__) {
    __SKIP_CONTROLS__ = localStorage.getItem('__SKIP_CONTROLS__') === 'on';
    new Button({
        content: () => __SKIP_CONTROLS__ ? 'Add controls screen' : 'Remove controls screen',
        onclick: () => {
            __SKIP_CONTROLS__ = !__SKIP_CONTROLS__;
            localStorage.setItem('__SKIP_CONTROLS__', __SKIP_CONTROLS__ ? 'on' : 'off');
        }
    });

    __SKIP_PALETTE__ = localStorage.getItem('__SKIP_PALETTE__') === 'on';
    new Button({
        content: () => __SKIP_PALETTE__ ? 'Add palette screen' : 'Remove palette screen',
        onclick: () => {
            __SKIP_PALETTE__ = !__SKIP_PALETTE__;
            localStorage.setItem('__SKIP_PALETTE__', __SKIP_PALETTE__ ? 'on' : 'off');
        }
    });
}

export let __TEST_LEVEL__ = false;
if (__DEV__) {
    __TEST_LEVEL__ = localStorage.getItem('__TEST_LEVEL__') === 'on';
    new Button({
        content: () => __TEST_LEVEL__ ? 'Go to game' : 'Go to test level',
        onclick: () => {
            __TEST_LEVEL__ = !__TEST_LEVEL__;
            localStorage.setItem('__TEST_LEVEL__', __TEST_LEVEL__ ? 'on' : 'off');

            if (__TEST_LEVEL__) {
                Game.setState(new TestScreen());
            }
            else {
                Game.setState(new LoadingScreen());
            }
        }
    })
}

if (__DEV__) {
    new Button({
        content: () => 'Clear save file',
        onclick: () => {
            SaveManager.clear();
            location.reload();
        }
    });
}

if (__DEV__) {
    debugElement.appendChild(document.createElement('br'));
    let stepButton;
    new Button({
        content: () => Game.timeScale !== 0 ? 'Pause' : 'Unpause',
        onclick: () => {
            if (Game.timeScale !== 0) {
                Game.timeScale = 0;
            }
            else {
                Game.timeScale = 1;
            }
        }
    });

    new Button({
        content: () => 'Step 1 frame',
        onclick: () => {
            Game.timeStep = 1 / 60;
        }
    });

    const keysElement = document.createElement('div');
    debugElement.appendChild(keysElement);

    const keyButton = (content: string, key: Keys) => {
        const btn = new Button({
            content: () => content,
            onclick: () => {
                if (btn.el.style.borderStyle === 'groove') {
                    document.onkeydown!(new KeyboardEvent('keydown', {
                        keyCode: KeyCodes[key],
                    }))
                    btn.el.style.borderStyle = 'inset';
                }
                else {
                    document.onkeyup!(new KeyboardEvent('keyup', {
                        keyCode: KeyCodes[key],
                    }))
                    btn.el.style.borderStyle = 'groove';
                }
            },
            parent: keysElement,
        });
        btn.el.style.borderWidth = '8px';
        btn.el.style.borderStyle = 'groove';
        return btn;
    }

    keyButton('←', Keys.LEFT);
    keyButton('→', Keys.RIGHT);
    keyButton('↑', Keys.UP);
    keyButton('↓', Keys.DOWN);
    keyButton('A', Keys.A);
    keyButton('B', Keys.B);
    keyButton('START', Keys.START);
    keyButton('SELECT', Keys.SELECT);
}