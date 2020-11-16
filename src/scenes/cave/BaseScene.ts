import Phaser, { GameObjects, Tilemaps } from 'phaser'
import { DirectionEnum } from '~/enum';
import { Enemy } from '~/actors/Enemy'

const PLAYER_VELOCITY_X = 100;

const [ PLAYER_JUMP_SPEED_X, PLAYER_JUMP_SPEED_Y ] = [ 0.5, -0.5 ];

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

  enemiesGroup!: Phaser.Physics.Arcade.Group;
  collisionLayersEnemiesCollider!: Phaser.Physics.Arcade.Collider;
  playerEnemiesCollider!: Phaser.Physics.Arcade.Collider;
  keys!: Controls;
  constructor(sceneKey: string, protected nextSceneKey: string | null, protected mapKey: string) {
    super({ key: sceneKey });
  }

  setupControls() {
    this.keys = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      climb: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
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

  }
graphics;
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

  isClimbing = false;
  isSliding = false;
 
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
  xAcc = 0;
  numberOfJumps = 0;
  timeSinceFirstJump = 0;
  checkJump() {
    const jumpDuration = this.keys.jump.getDuration();
    
    const jump = jumpDuration > this.delta && jumpDuration < this.delta * 10;
    if (this.onGround || this.onWall || this.isClimbing) {
      this.xAcc = 0;
      this.numberOfJumps = 0;
      this.timeSinceFirstJump = 0;
    } else if(Math.abs(this.xAcc) > 0) {
      this.xAcc -= Math.sign(this.xAcc) * this.delta / 10
    }
    
    const canJump = (this.numberOfJumps === 1 || (this.numberOfJumps === 0 && !this.onGround))  &&  (this.time.now - this.timeSinceFirstJump) > this.delta *  10

    if(jump && canJump) {
      this.player.body.velocity.y = 300 * PLAYER_JUMP_SPEED_Y;
      this.numberOfJumps++;
    }
    
    if(jump || (this.jumpTime < 0 && !this.onGround && !this.onWall)) {
      this.player.anims.play('jumping');
      if (this.onGround) {
        this.jumpTime = this.delta * 7;
        this.xAcc = 0;
        this.player.body.velocity.y += this.jumpTime * PLAYER_JUMP_SPEED_Y;
        this.timeSinceFirstJump = this.time.now
        this.numberOfJumps++;
        console.log('jump')
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

  facing = 1;
  delta = 0;
  update(time, delta) {
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
    this.onWall = (this.player.body.blocked.left || this.player.body.blocked.right) && !this.onGround
    this.checkSliding();
    this.checkJump();
  }
}
