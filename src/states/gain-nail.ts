import { Entity, Game, Sound, State, TextComponent } from "../../lib/juicy";
import { CoolText, FontFace } from "../components/cool-text";
import { PlayerAnimations } from "../components/player-animation";
import { SpriteComponent } from "../components/sprite";
import { ColorType } from "../helpers/palette";

export class GainNailScreen extends State {
    prevState: State;
    sprite: SpriteComponent;

    padding = 5;

    ready = false;
    fader: Entity;
    faderCtx: CanvasRenderingContext2D;

    constructor(prevState: State) {
        super();

        // Play powerup effect immediately idk
        Sound.Load('Powerup', {
            src: './audio/powerup.wav',
            isSFX: true,
            loop: false,
            volume: 0.5
        });
        Sound.Play('Powerup');

        const canvas = document.createElement('canvas');
        this.faderCtx = canvas.getContext('2d')!;
        {
            this.fader = new Entity(this);
            this.fader.position.x = this.padding;
            this.fader.position.y = this.padding;
            const sprite = this.fader.add(SpriteComponent);
            sprite.image = canvas;
            sprite.image.width = Game.size.x - 2 * this.padding;
            sprite.image.height = Game.size.y - 2 * this.padding;
            sprite.setSize(sprite.image.width, sprite.image.height);
            sprite.opacity = 0;
            this.remove(this.fader);
        }

        this.prevState = prevState;

        {
            const overlay = new Entity(this);
            overlay.add(SpriteComponent)
                .setImage('./images/gain-nail.png')
                .setSize(canvas.width, canvas.height)
                .onload = () => this.ready = true;
        }

        {
            const text = new Entity(this);
            text.add(CoolText).set({
                fontFace: FontFace.Big,
                text: 'You have acquired',
                brightness: ColorType.Light,
            });
            text.position.x = Math.floor((canvas.width - text.width) / 2);
            text.position.y = 10;
        }

        {
            const text = new Entity(this);
            text.add(CoolText).set({
                fontFace: FontFace.Big,
                text: 'a new form!',
                brightness: ColorType.Light,
            });
            text.position.x = Math.floor((canvas.width - text.width) / 2);
            text.position.y = 25;
        }

        {
            const player = new Entity(this);
            this.sprite = player.add(SpriteComponent)
                .setImage('./images/boy.png')
                .setSize(32, 24)
                .runAnimation({
                    ...PlayerAnimations.Attack,
                    repeat: true,
                });
            player.position.x = Math.floor((canvas.width - player.width) / 2);
            player.position.y = 55;
        }

        {
            const text = new Entity(this, [CoolText]);
            text.get(CoolText)?.set({
                text: `Press A to strike`,
                fontFace: FontFace.Big,
                brightness: ColorType.Light,
            });
            text.position.x = Math.floor((canvas.width - text.width) / 2);
            text.position.y = 85;
        }


        {
            const text = new Entity(this, [CoolText]);
            text.get(CoolText)?.set({
                text: `the air`,
                fontFace: FontFace.Big,
                brightness: ColorType.Light,
            });
            text.position.x = Math.floor((canvas.width - text.width) / 2);
            text.position.y = 95;
        }

        {
            const text = new Entity(this, [CoolText]);
            text.get(CoolText)?.set({
                text: `B to close`,
                fontFace: FontFace.Big,
            });
            text.position.x = Math.floor((canvas.width - text.width) / 2);
            text.position.y = 115;
        }
    }

    keyDown_A() {
        this.sprite.oncompleteanimation = () => {
            this.sprite.runAnimation(PlayerAnimations.Idle);
        }
        this.sprite.runAnimation(PlayerAnimations.Attack);
    }

    key_B() {
        Sound.Play('Back')
        this.game.setState(this.prevState);
    }

    update(dt: number) {
        super.update(dt);

        const fader = this.fader.get(SpriteComponent)!;
        if (fader.opacity < 1) {
            fader.opacity = Math.min(fader.opacity + 4 * dt, 1);
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        this.prevState.render(ctx);

        super.render(this.faderCtx);

        if (this.ready) {
            this.fader.render(ctx);
        }
    }
}