import { Component } from "../../lib/juicy";

export class Health extends Component {
    health = 1;
    maxHealth = 1;
    private dieCallback?: (health: Health) => void;

    onDie(callback: (health: Health) => void) {
        this.dieCallback = callback;
        return this; // enable chaining
    }

    setMaxHealth(maxHealth: number) {
        this.maxHealth = maxHealth;
    }

    setCurrentHealth(health: number) {
        this.health = health;
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
        this.health -= damage;
        if (this.health <= 0) {
            this.die();
        }
    }

    heal(amount: number) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }
}