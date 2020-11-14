import Phaser, { GameObjects, Tilemaps } from 'phaser'
import { DirectionEnum } from '~/enum';
import { Enemy } from '~/actors/Enemy'

const [ SCENE_WIDTH, SCENE_HEIGHT ] = [ 480, 320 ];

const [ PLAYER_VELOCITY_Y, PLAYER_VELOCITY_X ] = [ -9, 100 ];

export default class BaseScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  canJump = true;
  onWall = false;
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
  nextSceneKey: string | null;
  mapKey: string;
  keys!: Controls;

  constructor(sceneKey: string, nextSceneKey: string | null, mapKey: string) {
    super({ key: sceneKey });
    this.nextSceneKey = nextSceneKey;
    this.mapKey = mapKey;
  }

  setupControls() {
    this.keys = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    }
  }

  preload() {
    this.setupControls();
    this.load.tilemapTiledJSON('level_01', 'assets/levels/cave_level_01.json')
    this.load.tilemapTiledJSON('level_02', 'assets/levels/cave_level_02.json')
    this.load.tilemapTiledJSON('wall_jumping_test', 'assets/levels/wall_jumping_test.json')

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

  create() {
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

    this.physics.world.setBounds(0, 0, SCENE_WIDTH, SCENE_HEIGHT, true, true, false, true);
    this.cameras.main.setBounds(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

    this.cameras.main.startFollow(this.player, false, 0.5, 0.5, 0, 150);
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
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
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
        }
        else if (tile.properties.direction === "right")  {
          spike.body.setSize(SPIKE_HEIGHT, SPIKE_WIDTH);
        }
        else if (tile.properties.direction === "up") {
          spike.body.setSize(SPIKE_WIDTH, SPIKE_HEIGHT);
        }
        else {
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

  checkJump() {
    console.log(this.jumpTime)
    const onGround = this.player.body.blocked.down;
    if (this.keys.jump.isDown || (this.jumpTime < 0 && !onGround)) { // is jumping or is falling
      if(this.jumpTime < 0) {
        this.player.body.velocity.y += -this.jumpTime * PLAYER_VELOCITY_Y;
        this.jumpTime++;
      } else if(onGround) {
        this.jumpTime = 7;
        this.player.body.velocity.y += this.jumpTime * PLAYER_VELOCITY_Y;
      } else if(this.jumpTime > 0) {
        this.player.body.velocity.y += this.jumpTime * PLAYER_VELOCITY_Y;
        this.jumpTime--;
      }
    } else {
      this.jumpTime = 0;
    }
  }

  checkWallClimb() {
    if (this.onWall && (this.keys.left.isDown || this.keys.right)) {
      this.player.setVelocityY(0);
      this.player.setGravityY(0);
    } else {
      this.player.setGravityY(400);
    }
  }

  update() {
    if (this.keys.left.isDown && !this.onWall) {
      this.player.body.velocity.x = -PLAYER_VELOCITY_X;
      this.player.anims.play('left', true);
    } else if (this.keys.right.isDown && !this.onWall) {
      this.player.body.velocity.x = PLAYER_VELOCITY_X;
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    //this.canJump = this.player.body.blocked.down;
    //this.onWall = !this.player.body.blocked.down && (this.player.body.blocked.left || this.player.body.blocked.right);
    this.checkJump();
   // this.checkWallClimb();
  }
}
