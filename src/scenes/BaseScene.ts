import Phaser, { GameObjects, Tilemaps } from 'phaser'
import { DirectionEnum } from '~/enum';
import { Enemy } from '~/actors/Enemy'

const PLAYER_VELOCITY_X = 100;

const [ PLAYER_JUMP_SPEED_X, PLAYER_JUMP_SPEED_Y ] = [ 0.5, -0.6 ];

export default class BaseScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  canJump = true;
  onWall = false;
  onGround = false;
  wallJumpDirection = 0;
  jumpTime = 0;
  collisionLayersPlayerCollider!: Phaser.Physics.Arcade.Collider;
  map!: Phaser.Tilemaps.Tilemap;
  collisionLayers!: Phaser.Tilemaps.StaticTilemapLayer;
  groundLayers!: Phaser.Tilemaps.DynamicTilemapLayer;
  collisionLayersBox1Collider!: Phaser.Physics.Arcade.Collider;
  playerBox1Collider!: Phaser.Physics.Arcade.Collider;
  spikeGroup!: Phaser.Physics.Arcade.StaticGroup;
  objectivePoint!: GameObjects.GameObject;
  playerObjectiveCollider!: Phaser.Physics.Arcade.Collider;
  collisionLayersObjectivePointCollider!: Phaser.Physics.Arcade.Collider;
  xAcc = 0;
  numberOfJumps = 0;
  timeSinceFirstJump = 0;
  isClimbing = false;
  isSliding = false;
  facing = 1;
  delta = 0;

  enemiesGroup!: Phaser.Physics.Arcade.Group;
  collisionLayersEnemiesCollider!: Phaser.Physics.Arcade.Collider;
  playerEnemiesCollider!: Phaser.Physics.Arcade.Collider;
  keys!: Controls;
  graphics;
  box1!: Phaser.Physics.Arcade.Sprite;
  isMoveableCollidingWithCollisionLayers!: boolean;
  isPlayerCollidingHorizontallyWithMoveable!: boolean;
  isPlayerCollidingVerticallyWithMoveable!: boolean;
  moveableObjects: any;
  collisionLayersMoveableCollider!: Phaser.Physics.Arcade.Collider;
  playerMoveableCollider!: Phaser.Physics.Arcade.Collider;

  constructor(sceneKey: string, protected nextSceneKey: string | null, protected mapKey: string) {
    super({ key: sceneKey });
  }

  setupControls() {
    this.keys = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      climb: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      pull: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      push: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    }
  }

  preload() {
    this.load.tilemapTiledJSON(this.mapKey, `assets/levels/${this.mapKey}.json`)
    this.setupControls();

    this.load.spritesheet('ground', 'assets/levels/ground.png', {
      frameWidth: 16,
      startFrame: 0
    })

    this.load.spritesheet('utils', 'assets/levels/utils.png', {
      frameWidth: 16,
      startFrame: 0
    })

    this.load.spritesheet('dude',
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    )

    this.load.spritesheet('fire_monster',
      'assets/fire_monster.png',
      { frameWidth: 32, frameHeight: 32 }
    )

    this.load.spritesheet('box', 'assets/platform.png', {
      frameWidth: 16,
      startFrame: 0
    })
  }

  create() {
    this.graphics = this.add.graphics({ fillStyle: { color: 0x2266aa } });
    this.createMap(this.mapKey);
    this.createPlayer();
    this.createSpikes();
    this.createObjective();
    this.createEnemies();

    this.collisionLayersPlayerCollider = this.physics.add.collider(this.player, this.collisionLayers!, (player, tile: any) => {
      if (tile.properties.canDie) {
        tile.setCollisionCallback(() => {
          this.scene.restart();
        }, this);
      }
    });

    this.collisionLayersObjectivePointCollider = this.physics.add.collider(this.objectivePoint, this.collisionLayers);

    this.playerObjectiveCollider = this.physics.add.collider(this.player, this.objectivePoint, () => {
      this.scene.start(this.nextSceneKey!);
    });

    this.collisionLayersEnemiesCollider = this.physics.add.collider(this.enemiesGroup, this.collisionLayers);
    this.playerEnemiesCollider = this.physics.add.collider(this.player, this.enemiesGroup, (e, b) => {
      this.scene.restart();
    });

    this.moveableObjects = this.physics.add.group();

    const boxes = this.map.filterObjects('objects', o => o.name === 'box', this);

    boxes.forEach((box: any) => {
      const spriteBox = this.moveableObjects.create(box.x, box.y, 'box');
      spriteBox.setDrag(200);
      const massValue = box.properties.find(p => p.name === 'mass');
      spriteBox.setMass(massValue?.value);
    });

    this.collisionLayersMoveableCollider = this.physics.add.collider(this.moveableObjects, this.collisionLayers, () => {
      this.isMoveableCollidingWithCollisionLayers = true;
    });

    this.playerMoveableCollider = this.physics.add.collider(this.player, this.moveableObjects, (player, box) => {
      // this.isPlayerCollidingHorizontallyWithMoveable = this.player.body.touching.left || this.player.body.touching.right;
      // this.isPlayerCollidingVerticallyWithMoveable = this.player.body.touching.down;
    });

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, true, true, false, true);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, 0);
  }

  createObjective() {
    const obj: any = this.map.findObject('objects', obj => obj.name === 'objectivePoint', this);
    this.objectivePoint = this.physics.add.sprite(obj.x, obj.y, '');
  }

  createMap(key: string) {
    this.map = this.make.tilemap({ key });
    const tiles = this.map.addTilesetImage('ground', 'ground');
    this.groundLayers = this.map.createDynamicLayer('ground', tiles);

    const collidersTile = this.map.addTilesetImage('utils', 'utils');
    this.collisionLayers = this.map.createStaticLayer('colliders', collidersTile);
    this.collisionLayers.setVisible(false);
    this.collisionLayers.setCollisionByProperty({ collides: true });
  }

  createPlayer() {
    const spawnPoint: any = this.map.findObject("objects", obj => obj.name === "spawnPoint");
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'dude').setScale(0.5);
    this.player.setSize(20, 40).setOffset(5, 10);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'walking',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'jumping',
      frames: [{ key: 'dude', frame: 1 }]
    });

    this.anims.create({
      key: 'idle',
      frames: [{ key: 'dude', frame: 0 }]
    });

    this.player.setGravityY(400);

  }

  createSpikes() {
    this.spikeGroup = this.physics.add.staticGroup();
    this.physics.add.collider(this.player, this.spikeGroup, () => {
      this.scene.restart();
    });

    this.groundLayers.forEachTile((tile: Tilemaps.Tile) => {
      if (tile.properties?.name === "spike") {
        // A sprite has its origin at the center, so place the sprite at the center of the tile
        const x = tile.getCenterX();
        const y = tile.getCenterY();
        const spike: Phaser.Physics.Arcade.Sprite = this.spikeGroup.create(x, y);
        spike.setVisible(false);

        const [ SPIKE_WIDTH, SPIKE_HEIGHT ] = [ 12, 6];

        if (tile.properties.direction === "left") {
          spike.body.setSize(SPIKE_HEIGHT, SPIKE_WIDTH);
        } else if (tile.properties.direction === "right")  {
          spike.body.setSize(SPIKE_HEIGHT, SPIKE_WIDTH);
        } else if (tile.properties.direction === "up") {
          spike.body.setSize(SPIKE_WIDTH, SPIKE_HEIGHT);
        } else {
          spike.body.setSize(SPIKE_WIDTH, SPIKE_HEIGHT);
          spike.body.y += 3;
        }
      }
    });

  }

  createEnemies() {
    this.enemiesGroup = this.physics.add.group();
    const enemies: any = this.map.filterObjects('objects', o => o.name === 'enemy', this);

    this.anims.create({
      key: 'fire_monster_walking',
      frames: this.anims.generateFrameNumbers('fire_monster', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'fire_monster_dying',
      frames: this.anims.generateFrameNumbers('fire_monster', { start: 33, end: 40 }),
      frameRate: 10,
      repeat: 1
    });

    const spawnEnemies = () => {
      enemies.forEach((enemy: GameObjects.Shape) => {
        new Enemy(this,
          enemy.x,
          enemy.y,
          'fire_monster',
          this.enemiesGroup,
          enemy.rotation === 180 ? DirectionEnum.LEFT : DirectionEnum.RIGHT);
      });
    }

    spawnEnemies();
    this.time.addEvent({ delay: 10000, loop: true, callback: spawnEnemies, callbackScope: this});

  }

  checkSliding() {
    this.isSliding = Boolean(this.collisionLayers.getTileAtWorldXY(this.player.x + 10 * this.facing, this.player.y)) && !this.onGround;
    if(this.keys.climb.isUp || !this.isSliding) {
      if(this.isClimbing) {
        this.isClimbing = false;
      }
    }
    if(this.isSliding && this.keys.climb.isDown) {
      this.isClimbing = true;
    }
    if(this.isClimbing) {
      if(this.keys.down.isDown) {
        this.player.body.velocity.y = 100;
      } else if(this.keys.up.isDown) {
        this.player.body.velocity.y = -100;
      } else {
        this.player.body.velocity.y = 0;
      }
    } else if (this.onWall) {
      this.player.body.velocity.y = 50;
    }
  }

  checkJump() {
    const jumpDuration = this.keys.jump.getDuration();

    const jump = jumpDuration > this.delta && jumpDuration < this.delta * 10;
    if (this.onGround || this.onWall || this.isClimbing) {
      this.xAcc = 0;
      this.numberOfJumps = 0;
      this.timeSinceFirstJump = -1;
    } else if(Math.abs(this.xAcc) > 0) {
      this.xAcc -= Math.sign(this.xAcc) * this.delta / 10
    }

    if(this.numberOfJumps === 1 && this.keys.jump.isUp) {
      this.timeSinceFirstJump = this.time.now
    }

    const canDoubleJump = (this.numberOfJumps === 1 && this.timeSinceFirstJump > -1) ||
      (this.numberOfJumps === 0 && !this.onGround)  &&
      (this.time.now - this.timeSinceFirstJump) > this.delta

    if(this.keys.jump.isDown && canDoubleJump) {
      this.player.body.velocity.y = 300 * PLAYER_JUMP_SPEED_Y;
      this.numberOfJumps++;
    }

    if(jump || (this.jumpTime < 0 && !this.onGround && !this.onWall)) {
      this.player.anims.play('jumping');
      if (this.onGround) {
        this.jumpTime = this.delta * 7;
        this.xAcc = 0;
        this.player.body.velocity.y += this.jumpTime * PLAYER_JUMP_SPEED_Y;
        this.numberOfJumps++;

      } else if (this.onWall || this.isClimbing && Math.abs(this.xAcc) === 0) {
        this.jumpTime = this.delta * 4;
        this.facing *= -1;
        this.xAcc = this.facing * PLAYER_JUMP_SPEED_X * this.jumpTime;
        this.player.body.velocity.y = -this.jumpTime * PLAYER_JUMP_SPEED_Y;
        this.numberOfJumps = 0;
      } else if (this.jumpTime > 0) {
        this.player.body.velocity.y += this.jumpTime * PLAYER_JUMP_SPEED_Y;
        this.player.body.velocity.x += this.xAcc;
        this.jumpTime -= this.delta;
      }
    } else {
      this.jumpTime = 0;
    }

  }

  checkPull() {
    if (this.keys.pull.isDown && this.keys.push.isUp) {
      this.moveableObjects.children.iterate((object: Phaser.Physics.Arcade.Sprite) => {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, object.x, object.y);

        if (distance < 100) {
          if (object.body.mass > this.player.body.mass) {
            this.physics.moveTo(this.player, object.x, object.y, 200, 400);
          } else {
            this.physics.moveTo(object, this.player.x, this.player.y, 200, 400);
          }
        }
      })
    }
  }

  checkPush() {
    if (this.keys.push.isDown && this.keys.pull.isUp) {
      this.moveableObjects.children.iterate((object: Phaser.Physics.Arcade.Sprite) => {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, object.x, object.y);

        if (distance < 100) {
          if (object.body.mass > this.player.body.mass) {
            this.physics.moveTo(this.player, object.x, object.y, -200, -400);
          } else {
            this.physics.moveTo(object, this.player.x, this.player.y, -200, -400);
          }
        }
      })
    }
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.delta = delta;
    this.onGround = this.player.body.blocked.down;
    this.player.flipX = this.facing == 1;
    if (this.xAcc === 0 && !this.isClimbing) {
      if (this.keys.left.isDown) {
        this.player.body.velocity.x = -PLAYER_VELOCITY_X;
        this.facing = -1;
        if(this.onGround) {
          this.player.anims.play('walking', true);
        }
      } else if (this.keys.right.isDown) {
        this.player.body.velocity.x = PLAYER_VELOCITY_X;
        this.facing = 1;
        if(this.onGround) {
          this.player.anims.play('walking', true);
        }
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play('idle');
      }
    }
    this.onWall = (this.player.body.blocked.left || this.player.body.blocked.right) && !this.onGround;
    // this.isPlayerCollidingVerticallyWithMoveable = false;
    this.checkSliding();
    this.checkJump();
    this.checkPull();
    this.checkPush();
  }
}
