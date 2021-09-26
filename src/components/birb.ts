import { Component, Entity, Game, Point, rand } from "../../lib/juicy";
import { SaveManager } from "../helpers/save-manager";
import { VaniaScreen } from "../states/vania";
import { SpriteComponent } from "./sprite";
import { Hitbox } from "./stupid-hitbox";

export enum BirbDistance {
    close = 10,
    mid = 20,
    far = 30,
}

export enum BirbDetectionRadius {
    none = -1,
    close = 48,
    mid = 72,
    far = 120,
}

export class Birb extends Component {
    target?: Entity;
    followerDistance = BirbDistance.mid;
    detectionRadius = SaveManager.get('birb_bait') ? BirbDetectionRadius.mid : BirbDetectionRadius.none;
    isAggressive = false;
    speed = 0;
    maxSpeed = Math.random() * 10 + 45;
    flappiness = Math.random() * Math.PI * 2;
    detected = false;

    lolSpeed = Math.PI * (0.1 + Math.random() * 0.1);
    lol = Math.random() * Math.PI * 2;
    lolOffset = (Math.random() - 0.5) * Math.PI;

    update(dt: number, game: typeof Game) {
        if (this.target) {
            if (!this.detected) {
                if (this.target.position.copy().sub(this.entity.position).length() <= this.detectionRadius) {
                    this.detected = true;
                }
                else {
                    this.flappiness += dt * 5;
                    this.entity.position.y += Math.sin(this.flappiness) * 5 * dt;
                    return;
                }
            }

            this.speed = Math.min(this.speed + 20 * dt, this.maxSpeed);

            const targetCenter = this.target.position.copy().add(this.target.width / 2, this.target.height / 2);
            const myCenter = this.entity.position.copy().add(this.entity.width / 2, this.entity.height / 2)
            const toTarget = targetCenter.copy().sub(myCenter)
            const distance = toTarget.length();

            if (distance <= this.followerDistance + 10) {
                this.lol += this.lolSpeed * dt;
            }
            else {
                this.lol = Math.atan2(-toTarget.x, -toTarget.y) + this.lolOffset;
            }
            // console.log(this.lol);
            // Followers want to get close to the player, but not intercept their hitbox
            // Followers will always try to stay "FollowerDistance" away from the player unless aggressive
            let playerPosition = this.target.position.copy()
                .add(
                    this.target.width / 2 + this.followerDistance * Math.sin(this.lol),
                    this.target.height / 2 + this.followerDistance * Math.cos(this.lol)
                )
            // Add wing flapping randomness
            this.flappiness += dt * 5
            playerPosition.y += Math.sin(this.flappiness) * 2
            let followerPosition = this.entity.position.copy().add(new Point(this.entity.width / 2, this.entity.height / 2))
            let flightVector = playerPosition.copy().sub(followerPosition)

            if (flightVector.length() === 0) {
                return
            }

            let normalized = new Point(flightVector.x / flightVector.length() * dt * this.speed,
                flightVector.y / flightVector.length() * dt * this.speed)

            if (flightVector.length() < normalized.length()) {
                normalized = flightVector
            }

            this.entity.position.add(normalized)

            // Update sprite flippiness
            if (this.entity.position.x > this.target.position.x + this.target.width / 2) {
                this.entity.get(SpriteComponent)?.setFlip(true)
            } else {
                this.entity.get(SpriteComponent)?.setFlip(false)
            }
        }
    }
}