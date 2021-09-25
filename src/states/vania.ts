import {
    State,
    Point,
    Game,
    Entity,
} from "../../lib/juicy";
import { Hitbox } from "../components/stupid-hitbox";
import { MapComponent } from "../components/map";
import { SpriteComponent } from "../components/sprite";
import { PaletteSelectionScreen } from "./palette-selector";
import { PlayerPhysics } from "../components/player-physics";
import { Camera } from "../components/camera";
import { PlayerAnimation } from "../components/player-animation";
import { PlayerForm } from "../components/forms/player-form";
import { AttackForm } from "../components/forms/attack";
import { Transitioner } from "../components/transitioner";
import { MapTraveller } from "../components/map-traveller";
import { Teleporter } from "../helpers/map-loader";
import { Follower } from "../components/follower";
import { ParticleManagerComponent } from "../components/particle-manager"
import { SaveManager } from "../helpers/save-manager";
import { PowerupAnimations } from "../helpers/powerup";
import { GainNailScreen } from "./gain-nail";
import { Drowner } from "../components/drowner";
import { Health } from "../components/health";
import { PlayerHealthRender } from "../components/player-health-render";

const PlayerForms = [
    AttackForm
];

export class VaniaScreen extends State {
    map: MapComponent;
    player: Entity;
    enemies: Entity[] = [];
    camera: Entity;
    particles: Entity;
    ui: Entity;
    currentFormFrame: SpriteComponent;
    currentForm: SpriteComponent;
    ready = false;

    constructor() {
        super();

        const mapEntity = new Entity(this, [], 'map');
        this.map = mapEntity.add(MapComponent);
        this.player = new Entity(this, [
            Health,
            Transitioner,
            MapTraveller,
            SpriteComponent,
            Hitbox,
            PlayerPhysics,
            PlayerAnimation,
            Drowner,
        ], 'player');
        this.player.position.x = 46;
        this.player.position.y = 9 * 12;

        const hitbox = this.player.get(Hitbox)!;
        hitbox.setOffset(13, 5);
        hitbox.setSize(6, 19);

        this.camera = new Entity(this, [Camera]);
        this.camera.get(Camera)?.follow(this.player);

        // Player forms!
        this.player.add(AttackForm).setActive(false);

        let hasAnyForms = false;
        PlayerForms.forEach(Form => {
            const hasForm = this.hasForm(Form);
            // Set active to true if this is the first form we have
            this.player.add(Form).setActive(hasForm && !hasAnyForms);
            hasAnyForms ||= this.hasForm(Form);
        });

        // Teleportation
        this.player.get(MapTraveller)?.onTeleport(this.teleport.bind(this));

        // Health management
        const health = this.player.get(Health);
        health?.onDie(() => console.log('die'));
        health?.setCurrentHealth(3);
        health?.setMaxHealth(5);

        // Drowning
        this.player.get(Drowner)?.onDrown(() => {
            health?.takeDamage(1);
        });

        // Making UI lol
        this.ui = new Entity(this);
        this.remove(this.ui);

        this.particles = new Entity(this, [ParticleManagerComponent], 'particles')

        // Haha I'm hacking hahaha
        const formFrame = this.ui.addChild(new Entity(this));
        formFrame.position.x = this.game.size.x - 20;
        this.currentFormFrame = formFrame.add(SpriteComponent)
            .setImage('./images/forms.png')
            .setSize(20, 20)
            .runAnimation({ name: 'Frame', frameTime: 0, repeat: true, sheet: [0] })
            .setActive(hasAnyForms);

        const formType = this.ui.addChild(new Entity(this, [SpriteComponent]));
        formType.position = formFrame.position.copy();
        this.currentForm = formType.add(SpriteComponent)
            .setImage('./images/forms.png')
            .setSize(20, 20)
            .runAnimation({ name: 'Frame', frameTime: 0, repeat: true, sheet: [1] })
            .setActive(hasAnyForms);

        // Add player health to UI
        const playerHealth = this.ui.addChild(new Entity(this));
        playerHealth.position.x = 4;
        playerHealth.position.y = 4;
        playerHealth.add(PlayerHealthRender).health = this.player.get(Health);
    }

    init() {
    }

    hasForm<Form extends PlayerForm>(form: (new () => Form)) {
        return SaveManager.get(form.name);
    }

    unlockForm<Form extends PlayerForm>(form: (new () => Form)) {
        SaveManager.set(form.name, true);
        this.currentFormFrame.setActive(true);
        this.currentForm.setActive(true);
        this.setForm(form);
    }

    setForm<Form extends PlayerForm>(form: (new () => Form)) {
        this.player.components.forEach(c => {
            if (c instanceof PlayerForm) {
                c.setActive(c instanceof form);
            }
        });
    }

    key_SELECT() {
        this.game.setState(new PaletteSelectionScreen(this));
    }

    key_START() {
    }

    key_A() {
        this.player.components.forEach(c => {
            if (c instanceof PlayerForm && c.isActive()) {
                c.endAction();
            }
        })
    }

    keyDown_A() {
        this.player.components.forEach(c => {
            if (c instanceof PlayerForm && c.isActive()) {
                c.startAction();
            }
        })
    }

    key_B() {
    }

    key_UP() { }
    key_DOWN() { }
    key_LEFT() { }
    key_RIGHT() { }

    loadLevel(name: string, from?: string) {
        this.ready = false;
        this.map
            .load(name)
            .then((map) => {
                this.ready = true;
                this.camera.get(Camera)?.setBounds({
                    min: new Point(),
                    max: new Point(map.entity.width, map.entity.height)
                });

                // Spawn enemies bby
                map.enemySpawners.forEach(spawner => {
                    let enemy = new Entity(this);
                        enemy.position = spawner.position.copy();
                    if (spawner.enemyType === "birb") {
                        enemy.add(SpriteComponent)
                            .setImage('./images/birb.png')
                            .setSize(11, 11)
                            .runAnimation({
                                name: 'Idle',
                                sheet: [0, 1, 2, 3, 4],
                                frameTime: 0.15,
                                repeat: true
                            })

                        enemy.add(Follower).target = this.player
                        this.enemies.push(enemy);
                    }
                    else if (spawner.enemyType === 'egg') {
                        enemy.add(SpriteComponent)
                            .setImage('./images/home.png')
                            .setSize(102, 83)
                            .runAnimation({
                                name: 'Flicker',
                                sheet: [0, 1],
                                frameTime: 1,
                                repeat: true
                            });
                        map.addToBackground(enemy);
                    }
                    else if (spawner.enemyType === 'nail') {
                        if (!this.hasForm(AttackForm)) {
                            const sprite = enemy
                                .add(SpriteComponent)
                                .setImage('./images/powerup.png')
                                .setSize(11, 11)
                                .runAnimation(PowerupAnimations.Float);
                            enemy.add(Hitbox)
                                .onCollide = (other: Hitbox) => {
                                    enemy.remove(Hitbox);
                                    if (other.entity === this.player) {
                                        this.player.get(Transitioner)?.transition({
                                            type: 'GetForm',
                                            powerup: sprite,
                                            time: 15,
                                            onComplete: () => {
                                                this.unlockForm(AttackForm);
                                                Game.setState(new GainNailScreen(this))
                                            }
                                        });
                                    }
                                };
                        }
                        else {
                            this.remove(enemy);
                        }
                    }
                    else {
                        this.remove(enemy);
                    }
                })
                this.player.get(MapTraveller)?.spawn(map, from);
            })
            .catch((e) => {
                console.error(`failed loading level ${name}`)
                console.error(e);
                if (from) {
                    this.loadLevel(from);
                }
                else {
                    localStorage.removeItem('currentLevel');
                }
            });
    }

    teleport(teleporter: Teleporter) {
        this.enemies.forEach(element => {
            this.remove(element)
        });
        this.enemies = []
        this.loadLevel(teleporter.destination, this.map.name);
    }

    update(dt: number) {
        if (!this.ready) {
            return;
        }

        super.update(dt);

        this.ui.update(dt);
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(Math.floor(-this.camera.position.x), Math.floor(-this.camera.position.y));

        super.render(ctx);
        ctx.restore();

        this.ui.render(ctx);
    }
};
