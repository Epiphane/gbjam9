import { Component } from "../../lib/juicy";

export class Health extends Component {
    health = 1;
    maxHealth = 1;
    private dieCallback?: (health: Health) => void;

    isAlive() {
        return this.health > 0;
    }

    onDie(callback: (health: Health) => void) {
        const prev = this.dieCallback;
        if (prev) {
            this.dieCallback = (health: Health) => {
                callback(health);
                prev(health);
            };
        }
        else {
            this.dieCallback = callback;
        }
        return this; // enable chaining
    }

    setHealth(max: number, current?: number) {
        this.maxHealth = max;
        this.health = current ?? max;
        return this; // enable butts
    }

    setMaxHealth(maxHealth: number) {
        this.maxHealth = maxHealth;
        return this; // enable chaining
    }

    setCurrentHealth(health: number) {
        this.health = health;
        return this; // enable chaining
    }

    die() {
        if (this.dieCallback) {
            this.dieCallback(this);
        }
        else {
            // Simple mode, go bye bye
            this.entity.state.remove(this.entity);
        }
    }

    takeDamage(damage: number) {
        if (!this.isAlive()) {
            return;
        }

        this.health -= damage;
        if (!this.isAlive()) {
            this.die();
        }
    }

    heal(amount: number) {
        if (!this.isAlive()) {
            return;
        }

        this.health = Math.min(this.health + amount, this.maxHealth);
    }
}