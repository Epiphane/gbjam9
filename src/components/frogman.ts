import { BehaviorComponent, Component, Entity, Game, Point, Sound } from "../../lib/juicy";
import { SaveManager } from "../helpers/save-manager";
import { Camera } from "./camera";
import { Health } from "./health";
import { Obstacle } from "./obstacle";
import { PhysicsBody } from "./physics";
import { PlayerPhysics } from "./player-physics";
import { SpriteComponent } from "./sprite";
import { Hitbox } from "./stupid-hitbox";
import { Transitioner } from "./transitioner";

Sound.Load('Rumble', {
    src: './audio/rumble.wav',
    isSFX: true,
    loop: false,
    volume: 0.05
});

export class Frogman extends Component {
    hasLanded = false;
    player?: Entity;
    fighting = false;

    // Stolen from froggy
    jumpCooldown = Math.random() * 1;
    jumpDir = 0;
    windup = 0;
    jumping = true;
    falling = true;

    init(entity: Entity) {
        const sprite = entity.get(SpriteComponent);
        const health = entity.get(Health);
        const hitbox = entity.get(Hitbox);
        health?.onDie(() => {
            // Since onDie gets called even if something's already dead
            // the sound will keep playing if player keeps beating up frog.
            // Not sure if bug or feature
            Sound.Play('FrogDie');
            sprite?.runAnimation({
                name: 'Dead',
                sheet: [12],
                frameTime: 0.1,
                repeat: false,
            });

            const obstacle = entity.add(Obstacle);
            obstacle.isAFunnyBouncyBoy = true;
            obstacle.blockDirections.Up = false;
            obstacle.blockDirections.Right = false;
            obstacle.blockDirections.Left = false;

            // hitbox?.setSize(40, hitbox.getSize().y);
            entity.get(PhysicsBody)?.setActive(false);

            SaveManager.set('frogman_dead', entity.position);
        });

        const deathSpot = SaveManager.get('frogman_dead');
        if (deathSpot) {
            entity.position = new Point(deathSpot.x, deathSpot.y);
            health?.takeDamage(health.maxHealth);
        } else {
            // Only load frog death sound if it's not already dead from savefile
            Sound.Load('FrogDie',
                {
                    src: './audio/frog_die.wav',
                    isSFX: true,
                    volume: 0.3
                });
        }
    }

    jump() {
        const sprite = this.entity.get(SpriteComponent);
        const physics = this.entity.get(PhysicsBody);
        if (physics) {
            physics.velocity.y = -350;

            if (this.fighting) {
                physics.velocity.x = this.player!.position.x - this.entity.position.x;
            }
        }

        sprite?.setFlip(physics!.velocity.x > 0);
        this.jumping = true;
        this.falling = false;
    }

    update(dt: number) {
        this.player = this.entity.state.get('player');
        const transitioner = this.player?.get(Transitioner);
        const playerHealth = this.player?.get(Health)!;
        const playerHitbox = this.player?.get(Hitbox)!;
        const playerSprite = this.player?.get(SpriteComponent)!;

        const health = this.entity.get(Health);
        const hitbox = this.entity.get(Hitbox);
        const physics = this.entity.get(PhysicsBody)!;
        const sprite = this.entity.get(SpriteComponent);

        if (!health?.isAlive()) {
            return;
        }

        if (!this.fighting) {
            transitioner?.disableInteraction();
        }

        if (this.fighting && hitbox?.test(playerHitbox) && playerSprite.flickerTime <= 0) {
            const playerX = this.player!.position.x + this.player!.width / 2;
            const myX = this.entity.position.x + this.entity.width / 2;

            const dx = (playerX < myX) ? -75 : 75;
            this.player?.get(PlayerPhysics)?.knockBack(dx, -150, 0.5);
            playerSprite.setFlickering(1);
            playerHealth.takeDamage(1);
        }

        if (this.jumping) {
            const dy = physics.velocity.y;
            if (this.falling && physics.isBlocked(0, 1)) {
                physics.velocity.x = 0;

                sprite?.runAnimation({
                    name: 'Idle',
                    sheet: [2],
                    frameTime: 0.2,
                    repeat: false,
                });
                this.jumpCooldown = 1 + Math.random();
                this.jumping = false;
                Sound.Play('Rumble');

                if (!this.hasLanded) {
                    this.entity.state.get('camera')?.get(Camera)?.shake(0.3);
                    this.hasLanded = true;

                    this.player?.get(PlayerPhysics)?.knockBack(-100);

                    const title = new Entity(this.entity.state);
                    const sprite = title.add(SpriteComponent)
                        .setImage('./images/leaper.png')
                        .setSize(140, 37)
                        .runAnimation({ name: 'idk', sheet: [0], frameTime: 0 });
                    sprite.opacity = 0;
                    title.position.x = (Game.size.x - title.width) / 2
                    title.position.y = 20;

                    let titleTime = 8;
                    title.add(BehaviorComponent)
                        .setCallback((dt: number) => {
                            titleTime -= dt;
                            if (titleTime < 2) {
                                sprite.opacity = titleTime / 2;
                            }
                            else if (titleTime < 5.5) {
                                // 1 isn't working and i'm feeling lazy
                                sprite.opacity = 1.1;
                            }
                            else if (titleTime < 6.5) {
                                sprite.opacity = (6.5 - titleTime);
                            }
                            else {
                                sprite.opacity = 0;
                            }

                            if (titleTime < 0) {
                                this.entity.state.remove(title);
                                this.jump();
                                this.fighting = true;
                                transitioner?.enableInteraction();
                            }
                        })
                }

                return;
            }

            if (dy > 0) {
                sprite?.runAnimation({
                    name: 'Fall',
                    sheet: [1],
                    frameTime: 0.2,
                    repeat: true
                });
                this.falling = true;
            }
            else if (dy < 0) {
                sprite?.runAnimation({
                    name: 'Jump',
                    sheet: [8],
                    frameTime: 0.2,
                    repeat: true
                });
            }
        }
        else if (this.windup > 0) {
            this.windup -= dt;

            if (this.windup <= 0) {
                this.jump();
            }
        }
        else if (this.jumpCooldown <= 0) {
            this.windup = 0.2;
            // No animation yet lol
            sprite?.runAnimation({
                name: 'Prep',
                sheet: [2],
                frameTime: 1,
                repeat: false,
            });
        }
        else if (this.fighting) {
            this.jumpCooldown -= dt;
        }
    }
}