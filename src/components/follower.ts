import { Component, Entity, Game, Point, rand } from "../../lib/juicy";
import { VaniaScreen } from "../states/vania";
import { SpriteComponent } from "./sprite";
import { Hitbox } from "./stupid-hitbox";

enum FollowerDistance {
    close = 10,
    mid = 20,
    far = 30
}

export class Follower extends Component {
    target?: Entity
    followerDistance = FollowerDistance.mid;
    isAggressive = false
    speed = 50
    flappiness = Math.random() * Math.PI * 2

    lol = Math.random() * Math.PI * 2

    update(dt: number, game: typeof Game) {
        if (this.target) {
            this.lol += 0.1 * Math.PI * 2 * dt
            // Followers want to get close to the player, but not intercept their hitbox
            // Followers will always try to stay "FollowerDistance" away from the player unless aggressive
            let playerPosition = this.target.position.copy()
                .add(new Point(this.target.width / 2 + this.followerDistance * Math.sin(this.lol), this.target.height / 2 + this.followerDistance * Math.cos(this.lol)))
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