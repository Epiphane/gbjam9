import { Game } from "../../lib/juicy";

class SaveGame {
    id: string;
    private props: { [key: string]: any } = {};

    constructor(id: string) {
        this.id = id;
        this.load();
    }

    private load() {
        this.props = JSON.parse(localStorage.getItem(`save_${this.id}`) || '{}');
    }

    private persist() {
        localStorage.setItem(`save_${this.id}`, JSON.stringify(this.props));
    }

    get(name: string) {
        return this.props[name];
    }

    set(name: string, value: any) {
        this.props[name] = value;

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
};

const saveManager = Game.singleton(SaveManager);
export { saveManager as SaveManager };