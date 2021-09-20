import { Game } from "../../lib/juicy";
import { Hitbox } from "../components/stupid-hitbox";

const debugElement = document.createElement('div');
document.body.appendChild(debugElement);

// Dev mode
export const __DEV__ = localStorage.getItem('__DEV__') === 'on';
const devModeButton = document.createElement('button');
devModeButton.textContent = __DEV__ ? 'Turn off DevMode (reloads page)' : 'Turn on DevMode (reloads page)';
devModeButton.onclick = () => {
    localStorage.setItem('__DEV__', !__DEV__ ? 'on' : 'off');
    location.reload();
};
debugElement.appendChild(devModeButton);

// Apply palette
export let __PALETTE__ = true;
if (__DEV__) {
    __PALETTE__ = localStorage.getItem('__PALETTE__') !== 'off';
    const paletteButton = document.createElement('button');
    paletteButton.textContent = __PALETTE__ ? 'Turn off Palette' : 'Turn on Palette';
    paletteButton.onclick = () => {
        __PALETTE__ = !__PALETTE__;
        localStorage.setItem('__PALETTE__', __PALETTE__ ? 'on' : 'off');
        paletteButton.textContent = __PALETTE__ ? 'Turn off Palette' : 'Turn on Palette';
    };
    debugElement.appendChild(paletteButton);
}

// Show hitboxes
export let __HITBOXES__ = false;
if (__DEV__) {
    __HITBOXES__ = localStorage.getItem('__HITBOXES__') !== 'off';
    const hitboxButton = document.createElement('button');
    hitboxButton.textContent = __HITBOXES__ ? 'Hide hitboxes' : 'Show hitboxes';
    hitboxButton.onclick = () => {
        __HITBOXES__ = !__HITBOXES__;
        localStorage.setItem('__HITBOXES__', __HITBOXES__ ? 'on' : 'off');
        hitboxButton.textContent = __HITBOXES__ ? 'Hide hitboxes' : 'Show hitboxes';

        Game.getState().entities.forEach(e =>
            e.get(Hitbox)?.setVisible(__HITBOXES__));
    };
    debugElement.appendChild(hitboxButton);
}