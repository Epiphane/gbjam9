import { PaletteManager } from '../helpers/palette';
import { SpriteComponent } from './sprite';

export class ColoredSpriteComponent extends SpriteComponent {
    setImage(url: string) {
        this.image = PaletteManager.loadImage(url);
        this.image.onload = this.onImageLoad;

        return this; // Enable chaining
    }
};
