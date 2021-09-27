var SFX: { [key: string]: MultiSampleSound } = {};
var BGM: { [key: string]: MultiSampleSound } = {};

type SoundProperties = {
    src: string;
    isSFX: boolean;
    loop?: boolean;
    samples?: number;
    volume?: number;
}

class MultiSampleSound {
    elements: HTMLAudioElement[] = [];
    volume: number = 1;
    index: number = 0;

    constructor(props: SoundProperties) {
        if (!props.samples) {
            props.samples = 1;
        }

        for (var i = 0; i < props.samples; i++) {
            var sound = document.createElement('audio');
            sound.volume = props.volume || 1;
            sound.loop = !!props.loop;

            var source = document.createElement("source");
            source.src = props.src;
            sound.appendChild(source);
            sound.load();
            this.elements.push(sound);
        }
    }

    play() {
        this.elements[this.index]?.play();
        this.index = (this.index + 1) % this.elements.length;
    }

    pause() {
        this.elements.forEach(el => el.pause());
    }

    stop() {
        this.elements.forEach(el => {
            el.pause();
            el.currentTime = 0;
        });
    }
}

export function MuteMusic() {
    for (const key in BGM) {
        BGM[key]?.elements.forEach(function (element) {
            element.volume = 0;
        });
    }
}

export function MuteSfx() {
    for (const key in SFX) {
        SFX[key]?.elements.forEach(function (element) {
            element.volume = 0;
        });
    }
}

export function Play(name: string) {
    let sound = SFX[name] ?? BGM[name];
    sound?.play();
}

export function Pause(name: string) {
    let sound = SFX[name] ?? BGM[name];
    sound?.pause()
}

export function Load(name: string, properties: SoundProperties) {
    if (properties.isSFX) {
        SFX[name] = new MultiSampleSound(properties);
    } else {
        BGM[name] = new MultiSampleSound(properties);
    }
}
