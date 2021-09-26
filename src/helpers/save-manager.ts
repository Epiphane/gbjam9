import { Game } from "../../lib/juicy";
import { __DEV__ } from "./debug";

class SaveGame {
    id: string;
    private props: { [key: string]: any } = {};

    constructor(id: string) {
        this.id = id;
        this.load();
    }

    private load() {
        const existing = localStorage.getItem(`save_${this.id}`) || '{}';
        try {
            this.props = JSON.parse(existing);
        } catch (e) {
            this.props = JSON.parse(atob(existing));
        }

        this.persist();
    }

    private persist() {
        let data = JSON.stringify(this.props);
        localStorage.setItem(`save_${this.id}`, __DEV__ ? data : btoa(data));
    }

    get(name: string) {
        return this.props[name];
    }

    set(name: string, value: any) {
        this.props[name] = value;

        this.persist();
    }

    clear() {
        this.props = {};
        this.persist();
    }
}

class SaveManager {
    currentSave = new SaveGame('default');

    get(name: string) {
        return this.currentSave.get(name);
    }

    set(name: string, value: any) {
        this.currentSave.set(name, value);
    }

    clear() {
        this.currentSave.clear();
    }
};

const saveManager = Game.singleton(SaveManager);
export { saveManager as SaveManager };