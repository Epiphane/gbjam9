import {
    State,
    Point,
    Game,
    Entity,
    BehaviorComponent,
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
import { ParticleManagerComponent } from "../components/particle-manager"
import { SaveManager } from "../helpers/save-manager";
import { PowerupAnimations } from "../helpers/powerup";
import { GainNailScreen } from "./gain-nail";
import { Drowner } from "../components/drowner";
import { Health } from "../components/health";
import { PlayerHealthRender } from "../components/player-health-render";
import { __HITBOXES__ } from "../helpers/debug";
import { Birb, BirbDetectionRadius, BirbDistance } from "../components/birb";
import { PlayerEvents } from "../components/player-events";
import { Obstacle } from "../components/obstacle";
import { Frogman } from "../components/frogman";
import { DashForm } from "../components/forms/dash";
import { GainDashScreen } from "./gain-dash";
import { PhysicsBody } from "../components/physics";
import { Froggy } from "../components/froggy";

const PlayerForms: (new () => PlayerForm)[] = [
    AttackForm,
    DashForm,
];

export class VaniaScreen extends State {
    map: MapComponent;
    player: Entity;
    birbs: Entity[] = [];
    enemies: Entity[] = [];
    camera: Camera;
    particles: Entity;
    ui: Entity;
    currentFormFrame: SpriteComponent;
    currentForm: SpriteComponent;
    currentFormNdx = SaveManager.get('current_form') ?? -1;
    ready = false;
    blackout?: Entity;

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
            PlayerEvents,
        ], 'player');
        this.player.position.x = 46;
        this.player.position.y = 9 * 12;
        this.player.priority = 100;

        const hitbox = this.player.get(Hitbox)!;
        hitbox.setOffset(13, 5);
        hitbox.setSize(6, 19);

        const camera = new Entity(this, [], 'camera');
        this.camera = camera.add(Camera).follow(this.player);
        camera.priority = this.player.priority + 1;

        // Player forms!
        let defaultForm : (new () => PlayerForm) | null = null;
        PlayerForms.forEach((Form, ndx) => {
            if (this.hasForm(Form) && !defaultForm) {
                defaultForm = Form;
            }
            this.player.add(Form).setActive(false);
        });

        // Teleportation
        this.player.get(MapTraveller)?.onTeleport(this.teleport.bind(this));

        // Health management
        const health = this.player.get(Health);
        health?.onDie(() => this.playerDied());
        health?.setCurrentHealth(5);
        health?.setMaxHealth(5);

        // Drowning
        this.player.get(Drowner)?.onDrown((lastPos: Point) => {
            health?.takeDamage(1);
            if (health?.isAlive()) {
                this.player.position = lastPos.copy();
            }
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
            .setActive(defaultForm !== null);

        const formType = this.ui.addChild(new Entity(this, [SpriteComponent]));
        formType.position = formFrame.position.copy();
        this.currentForm = formType.add(SpriteComponent)
            .setImage('./images/forms.png')
            .setSize(20, 20)
            .runAnimation({ name: 'Frame', frameTime: 0, repeat: true, sheet: [1] })
            .setActive(defaultForm !== null);

        // Add player health to UI
        const playerHealth = this.ui.addChild(new Entity(this));
        playerHealth.position.x = 4;
        playerHealth.position.y = 4;
        playerHealth.add(PlayerHealthRender).health = this.player.get(Health);

        // Pick form
        if (this.currentFormNdx >= 0) {
            this.setForm(PlayerForms[this.currentFormNdx]!)
        }
        else if (defaultForm) {
            this.setForm(defaultForm);
        }
    }

    init() {
    }

    get(name: string) {
        return super.get(name) ?? this.map.get(name);
    }

    playerDied() {
        this.player.get(Transitioner)?.disableInteraction();

        this.blackout = new Entity(this);
        this.blackout.priority = this.player.priority + 100;
        this.remove(this.blackout);
        const sprite = this.blackout.add(SpriteComponent);
        sprite.setSize(this.game.size.x, this.game.size.y);
        sprite.image.width = this.game.size.x;
        sprite.image.height = this.game.size.y;
        sprite.opacity = 0;

        const ctx = sprite.image.getContext('2d')!;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, sprite.image.width, sprite.image.height);

        this.blackout.add(BehaviorComponent).setCallback((dt: number) => {
            sprite.opacity += dt;

            if (sprite.opacity >= 2) {
                this.blackout = undefined;
                this.respawn();
            }
        });
    }

    respawn() {
        this.player.get(Transitioner)?.enableInteraction();

        const health = this.player.get(Health);
        health?.setCurrentHealth(health.maxHealth);
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
        this.currentFormNdx = PlayerForms.indexOf(form);
        this.player.components.forEach(c => {
            if (c instanceof PlayerForm) {
                c.setActive(c instanceof form);
            }
        });
        SaveManager.set('current_form', this.currentFormNdx);

        this.currentForm?.runAnimation({
            name: `Form ${this.currentFormNdx}`,
            sheet: [this.currentFormNdx + 1],
            frameTime: 1,
        })
    }

    key_SELECT() {
        this.game.setState(new PaletteSelectionScreen(this));
    }

    key_START() {
    }

    key_A() {
        if (this.player.get(Transitioner)?.currentTransition) {
            return;
        }

        this.player.components.forEach(c => {
            if (c instanceof PlayerForm && c.isActive()) {
                c.endAction();
            }
        })
    }

    keyDown_A() {
        if (this.player.get(Transitioner)?.currentTransition) {
            return;
        }

        this.player.components.forEach(c => {
            if (c instanceof PlayerForm && c.isActive()) {
                c.startAction();
            }
        })
    }

    key_B() {
        let nextFormNdx = (this.currentFormNdx + 1) % PlayerForms.length;
        while (nextFormNdx !== this.currentFormNdx) {
            if (this.hasForm(PlayerForms[nextFormNdx]!)) {
                this.setForm(PlayerForms[nextFormNdx]!);
                return;
            }
            nextFormNdx = (nextFormNdx + 1) % PlayerForms.length;;
        }
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
                this.camera.setBounds({
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

                        enemy.add(Birb).target = this.player
                        this.birbs.push(enemy);
                    }
                    else if (spawner.enemyType === "froggy") {
                        const sprite = enemy.add(SpriteComponent)
                            .setImage('./images/froggy.png')
                            .setSize(10, 10)
                            .runAnimation({
                                name: 'Idle',
                                sheet: [0],
                                frameTime: 0.15,
                                repeat: true
                            })
                        enemy.add(Hitbox).setSize(10, 8).setOffset(0, 2);

                        const id = this.enemies.length;
                        const froggy = enemy.add(Froggy);
                        const physics = enemy.add(PhysicsBody);
                        const health = enemy.add(Health).setHealth(1, 1).onDie(() => {
                            sprite.runAnimation({
                                name: 'Die',
                                sheet: [4, 5],
                                frameTime: 0.5,
                            })

                            froggy.setActive(false);
                            physics.velocity.x = 0;
                            SaveManager.set(`${name}_frog_${id}`, enemy.position);
                        })

                        const deathSpot = SaveManager.get(`${name}_frog_${id}`);
                        if (deathSpot) {
                            enemy.position = new Point(deathSpot.x, deathSpot.y);
                            health.takeDamage(1);
                            sprite.sheet = [5];
                        }

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
                    else if (spawner.enemyType === 'birb_mother' && !SaveManager.get('birb_bait')) {
                        enemy.name = 'BirbMom';
                        enemy.add(SpriteComponent)
                            .setImage('./images/birb_mother.png')
                            .setSize(50, 40)
                            .runAnimation({
                                name: 'Sit',
                                sheet: [0],
                                frameTime: 1,
                                repeat: true
                            });
                        map.addToBackground(enemy);
                    }
                    else if (spawner.enemyType === 'nail' && !this.hasForm(AttackForm)) {
                        const sprite = enemy
                            .add(SpriteComponent)
                            .setImage('./images/powerup.png')
                            .setSize(11, 11)
                            .runAnimation(PowerupAnimations.Float);
                        enemy.priority = this.player.priority + 1;
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
                    else if (spawner.enemyType === 'dash' && !this.hasForm(DashForm)) {
                        const sprite = enemy
                            .add(SpriteComponent)
                            .setImage('./images/powerup.png')
                            .setSize(11, 11)
                            .runAnimation(PowerupAnimations.Float);
                        enemy.priority = this.player.priority + 1;
                        enemy.add(Hitbox)
                            .onCollide = (other: Hitbox) => {
                                enemy.remove(Hitbox);
                                if (other.entity === this.player) {
                                    this.player.get(Transitioner)?.transition({
                                        type: 'GetForm',
                                        powerup: sprite,
                                        time: 15,
                                        onComplete: () => {
                                            this.unlockForm(DashForm);
                                            Game.setState(new GainDashScreen(this))
                                        }
                                    });
                                }
                            };
                    }
                    else if (spawner.enemyType === 'SpikeWall') {
                        enemy.name = 'SpikeWall';
                        enemy.add(SpriteComponent)
                            .setImage('./images/spikewall.png')
                            .setSize(8, 36)
                            .runAnimation({
                                name: 'New wall not dropped',
                                sheet: [0],
                                frameTime: 0.05,
                                repeat: false,
                            });
                        enemy.add(Obstacle).setActive(false);
                        enemy.add(Hitbox).setSize(8, 36);
                    }
                    else {
                        this.remove(enemy);
                    }
                })
                this.player.get(MapTraveller)?.spawn(map, from);
                this.camera.snapCamera();

                if (map.triggers.filter(t => t.name === 'FrogBoss').length > 0) {
                    const deathSpot = SaveManager.get('frogman_dead');
                    if (deathSpot) {
                        const frogman = new Entity(this);
                        frogman.add(SpriteComponent)
                            .setImage('./images/frogman.png')
                            .setSize(60, 60);

                        frogman.add(Hitbox).setSize(50, 36).setOffset(2, 14);
                        frogman.add(Health).setHealth(1, 1);
                        frogman.add(Frogman);
                    }
                }
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
        this.enemies = [];
        this.birbs.forEach(birb => {
            this.remove(birb)
        });
        this.birbs = [];
        this.loadLevel(teleporter.destination, this.map.name);
    }

    update(dt: number) {
        if (!this.ready) {
            return;
        }

        super.update(dt);

        this.ui.update(dt);
        this.blackout?.update(dt);
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const { x, y } = this.camera.entity.position;
        ctx.translate(Math.floor(-x), Math.floor(-y));

        super.render(ctx);
        ctx.restore();

        this.ui.render(ctx);
        this.blackout?.render(ctx);
    }
};
