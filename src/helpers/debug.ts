import { Game } from "../../lib/juicy";
import { Hitbox } from "../components/stupid-hitbox";
import { LoadingScreen } from "../states/loading";
import { TestScreen } from "../states/test";
import { SaveManager } from "./save-manager";

const debugElement = document.createElement('div');
document.body.appendChild(debugElement);

class Button {
    content: () => string;
    el = document.createElement('button');

    constructor({ content, onclick }: {
        content: () => string,
        onclick?: () => void,
    }) {
        this.content = content;
        this.el.textContent = this.content();
        this.el.onclick = () => {
            onclick?.();
            this.el.textContent = this.content();
        };
        debugElement.appendChild(this.el);
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