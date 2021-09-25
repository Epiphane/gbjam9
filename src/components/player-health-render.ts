import { Component } from "../../lib/juicy";
import { Health } from "./health";

export class PlayerHealthRender extends Component {
    health?: Health;
    image = new Image();
    showHealth = 0;

    constructor() {
        super();

        this.image.src = './images/healthcounter.png';
    }

    update(dt: number) {
        if (!this.health) {
            return;
        }

        // Animate health in.
        const speed = 5;
        const { health } = this.health;
        if (this.showHealth < health) {
            this.showHealth += speed * dt;
            this.showHealth = Math.min(this.showHealth, health);
        }
        else if (this.showHealth > health) {
            this.showHealth -= speed * dt;
            this.showHealth = Math.max(this.showHealth, health);
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        if (!this.health) {
            return;
        }

        const { maxHealth } = this.health;
        for (let i = 0; i < maxHealth; i++) {
            if (i + 1 <= this.showHealth) {
                ctx.drawImage(this.image, 0, 0, 8, 10, i * 10, 0, 8, 10);
            }
            else if (i + 0.75 < this.showHealth) {
                ctx.drawImage(this.image, 8, 0, 8, 10, i * 10, 0, 8, 10);
            }
            else if (i + 0.5 < this.showHealth) {
                ctx.drawImage(this.image, 16, 0, 8, 10, i * 10, 0, 8, 10);
            }
            else if (i + 0.25 < this.showHealth) {
                ctx.drawImage(this.image, 24, 0, 8, 10, i * 10, 0, 8, 10);
            }
            else {
                ctx.drawImage(this.image, 32, 0, 8, 10, i * 10, 0, 8, 10);
            }
        }
    }
}