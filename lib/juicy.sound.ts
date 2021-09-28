import { Game } from "./juicy";

type SoundProperties = {
    src: string;
    isSFX: boolean;
    loop?: boolean;
    samples?: number;
    volume?: number;
}

class MultiSampleSound {
    elements: HTMLAudioElement[] = [];
    index = 0;

    isSFX: boolean;
    loop: boolean;
    samples: number;
    defaultVolume: number;
    volumeModifier = 1;

    constructor(props: SoundProperties) {
        this.isSFX = props.isSFX;
        this.loop = props.loop ?? false;
        this.samples = props.samples ?? 1;
        this.defaultVolume = props.volume ?? 1;

        for (var i = 0; i < this.samples; i++) {
            var sound = document.createElement('audio');
            sound.volume = this.defaultVolume;
            sound.loop = !!this.loop;

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

    setVolumeModifier(volumeModifier: number) {
        this.volumeModifier = volumeModifier;
        this.elements.forEach(el => el.volume = this.volumeModifier * this.defaultVolume);
    }
}

export class SoundManager {
    SFX: { [key: string]: MultiSampleSound } = {};
    BGM: { [key: string]: MultiSampleSound } = {};

    SFXVolume = parseInt(localStorage.getItem('SFXVolume') ?? '1');
    SFXMuted = localStorage.getItem('SFXMuted') === '1';
    BGMVolume = parseInt(localStorage.getItem('BGMVolume') ?? '1');
    BGMMuted = localStorage.getItem('BGMMuted') === '1';

    MuteMusic() {
        this.BGMMuted = true;
        for (const key in this.BGM) {
            this.BGM[key]?.setVolumeModifier(0);
        }
        localStorage.setItem('BGMMuted', '1');
    }

    UnmuteMusic() {
        this.BGMMuted = false;
        for (const key in this.BGM) {
            this.BGM[key]?.setVolumeModifier(this.BGMVolume);
        }
        localStorage.setItem('BGMMuted', '0');
    }

    SetMusicVolume(volume: number) {
        this.BGMVolume = volume;
        for (const key in this.BGM) {
            this.BGM[key]?.setVolumeModifier(this.BGMMuted ? 0 : this.BGMVolume);
        }
        localStorage.setItem('BGMVolume', `${this.BGMVolume}`);
    }

    MuteSfx() {
        this.SFXMuted = true;
        for (const key in this.SFX) {
            this.SFX[key]?.setVolumeModifier(0);
        }
        localStorage.setItem('SFXMuted', '1');
    }

    UnmuteSfx() {
        this.SFXMuted = false;
        for (const key in this.SFX) {
            this.SFX[key]?.setVolumeModifier(this.SFXVolume);
        }
        localStorage.setItem('SFXMuted', '0');
    }

    SetSfxVolume(volume: number) {
        this.SFXVolume = volume;
        for (const key in this.SFX) {
            this.SFX[key]?.setVolumeModifier(this.SFXMuted ? 0 : this.SFXVolume);
        }
        localStorage.setItem('SFXVolume', `${this.SFXVolume}`);
    }

    Play(name: string) {
        let sound = this.SFX[name] ?? this.BGM[name];
        sound?.play();
    }

    Pause(name: string) {
        let sound = this.SFX[name] ?? this.BGM[name];
        sound?.pause()
    }

    Load(name: string, properties: SoundProperties) {
        if (properties.isSFX) {
            this.SFX[name] = new MultiSampleSound(properties);
            this.SFX[name]?.setVolumeModifier(this.SFXMuted ? 0 : this.SFXVolume);
        } else {
            this.BGM[name] = new MultiSampleSound(properties);
            this.BGM[name]?.setVolumeModifier(this.BGMMuted ? 0 : this.BGMVolume);
        }
    }
}
