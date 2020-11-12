import Phaser, { GameObjects, Tilemaps } from 'phaser'

const [ SCENE_WIDTH, SCENE_HEIGHT ] = [ 30, 20 ];

export default class Level01Scene extends Phaser.Scene {
  platforms: any;
  player!: Phaser.Physics.Arcade.Sprite;
  cursors: any;
  stars: any;
  score: number = 0;
  scoreText: any;
  bombs: any;
  jumpCount: number = 0;
  canJump: boolean = true;
  collisionLayersPlayerCollider!: Phaser.Physics.Arcade.Collider;
  isPlayerCollidingWithCollisionLayers: boolean = false;
  isPlayerCollidingHorizontallyWithBox1: boolean = false;
  isPlayerCollidingVerticallyWithBox1: boolean = false;
  isBox1CollidingWithCollisionLayers: boolean = false;
  box1!: Phaser.Physics.Arcade.Sprite;
  fireElemental!: Phaser.Physics.Arcade.Sprite;

  map!: Phaser.Tilemaps.Tilemap;
  collisionLayers!: Phaser.Tilemaps.StaticTilemapLayer;
  groundLayers!: Phaser.Tilemaps.DynamicTilemapLayer;
  collisionLayersBox1Collider!: Phaser.Physics.Arcade.Collider;
  playerBox1Collider!: Phaser.Physics.Arcade.Collider;
  aKey!: Phaser.Input.Keyboard.Key;
  sKey!: Phaser.Input.Keyboard.Key;
  dKey!: Phaser.Input.Keyboard.Key;
  wKey!: Phaser.Input.Keyboard.Key;
  collisionLayersFireElementalCollider!: Phaser.Physics.Arcade.Collider;
  playerFireElementalCollider!: Phaser.Physics.Arcade.Collider;
  spikeGroup!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('gamejam2020');
  }

  preload() {
    this.load.tilemapTiledJSON('base_json', 'assets/levels/level01.json')

    this.load.spritesheet('ground', 'assets/levels/ground.png', {
			frameWidth: 16,
      startFrame: 0
    })

		this.load.spritesheet('utils', 'assets/levels/utils.png', {
			frameWidth: 16,
      startFrame: 0
    })

    this.load.spritesheet('box1', 'assets/platform.png', {
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
    this.createMap();
    this.createPlayer();
    this.createSpikes();
    this.createFireElemental();

    this.collisionLayersPlayerCollider = this.physics.add.collider(this.player, this.collisionLayers!, (player, tile: any) => {
      if (tile.properties.canDie) {
        tile.setCollisionCallback(() => {
          this.scene.restart();
        }, this);
      }
      this.isPlayerCollidingWithCollisionLayers = true;
    });

    this.collisionLayersFireElementalCollider = this.physics.add.collider(this.fireElemental, this.collisionLayers);
    this.playerFireElementalCollider = this.physics.add.collider(this.player, this.fireElemental, () => {
      this.scene.restart();
    });

    this.box1 = this.physics.add.sprite(190, 200, 'box1');
    this.box1.setDrag(Infinity, 0);

    this.collisionLayersBox1Collider = this.physics.add.collider(this.box1, this.collisionLayers, (box, tile: any) => {
      if (tile.properties.canDie) {
        tile.setCollisionCallback(() => {
          box.body.gameObject.setX(190)
          box.body.gameObject.setY(200)
        }, this);
      }

      this.isBox1CollidingWithCollisionLayers = true;
    });

    this.playerBox1Collider = this.physics.add.collider(this.player, this.box1, (player, box) => {
      this.isPlayerCollidingHorizontallyWithBox1 = this.player.body.touching.left || this.player.body.touching.right;
      this.isPlayerCollidingVerticallyWithBox1 = this.player.body.touching.down;
    });

    this.createControls();

    this.physics.world.setBounds(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    this.cameras.main.setBounds(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

    this.cameras.main.startFollow(this.player, false, 0.5, 0.5, 0, 150);
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.aKey = this.input.keyboard.addKey('A');
    this.sKey = this.input.keyboard.addKey('S');
    this.dKey = this.input.keyboard.addKey('D');
    this.wKey = this.input.keyboard.addKey('W');
  }

  createMap() {
    this.map = this.make.tilemap({ key: 'base_json' });
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
        const spike: Phaser.Physics.Arcade.Sprite = this.spikeGroup.create(x, y, '');
        spike.setVisible(false);
    
        if (tile.properties?.direction === "left") { 
          spike.body.setSize(6, 18);
        }
        else if (tile.properties?.direction === "right")  {
          spike.body.setSize(6, 18);
        }
        else if (tile.properties?.direction === "up") { 
          spike.body.setSize(18, 6);
        }
        else {
          spike.body.setSize(18, 6);
        }
        // And lastly, remove the spike tile from the layer
        //this.collisionLayers.removeTileAt(tile.x, tile.y);
      }
    });

  }

  createFireElemental() {
    this.fireElemental = this.physics.add.sprite(15, 0, 'fire_monster');
    this.fireElemental.setSize(16, 16).setOffset(6, 16);
    this.anims.create({
      key: 'walking',
      frames: this.anims.generateFrameNumbers('fire_monster', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
  
    this.fireElemental.setGravityY(400);
    this.fireElemental.anims.play('walking')
    this.fireElemental.setVelocityX(10);
  }

  checkJump() {
    if (this.cursors.up.isDown && this.canJump) {
      this.jumpCount += 1;
      this.canJump = false
      this.player.setVelocityY(-200);
    }

    if (this.isPlayerCollidingWithCollisionLayers || this.isPlayerCollidingVerticallyWithBox1) {
      this.jumpCount = 0;
      this.canJump = true
    }

    if (this.cursors.up.isUp && this.jumpCount <= 1) {
      this.canJump = true
    }
  }

  checkBoxPushing() {
    if (!this.box1.body.immovable) {
      if ((this.cursors.right.isDown || this.cursors.left.isDown) && this.isPlayerCollidingHorizontallyWithBox1) {
        if (this.cursors.right.isDown) {
          this.physics.moveTo(this.box1, this.box1.x + 10, this.box1.y);
        } else if (this.cursors.left.isDown) {
          this.physics.moveTo(this.box1, this.box1.x - 10, this.box1.y);
        }
      }
    }
  }

  checkScalePower() {
    if (this.isPlayerCollidingHorizontallyWithBox1) {
      if (this.aKey.isDown && this.box1.scale < 2) {
        this.box1.setScale(2);
      } else if (this.sKey.isDown && this.box1.scale >= 2) {
        this.box1.setScale(1);
      }

      this.box1.setImmovable(this.box1.scale >= 2)
    }
  }

  checkFloatingPower() {
    if (this.isPlayerCollidingVerticallyWithBox1) {
      if (this.dKey.isDown) this.box1.setVelocityY(-100);
    }

    if (this.isBox1CollidingWithCollisionLayers && this.dKey.isUp) {
      this.box1.setVelocityY(0)
    }
  }

  checkShotPower() {
    if (this.isPlayerCollidingHorizontallyWithBox1 && this.wKey.isDown && !this.box1.body.immovable) {
      const isPlayerRightOfTheBox = this.box1.body.x - this.player.body.x > 0;
      this.box1.setDrag(0);
      if (isPlayerRightOfTheBox) {
        this.box1.setVelocityX(500);
      } else {
        this.box1.setVelocityX(-500);
      }
    }

    if (Math.abs(this.box1.body.velocity.x) < 1) {
      this.box1.setDrag(Infinity, 0);
    }
  }

  update() {
    if (this.cursors) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-120);
        this.player.anims.play('left', true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(120);
        this.player.anims.play('right', true);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play('turn');
      }

      this.checkJump()
      this.checkBoxPushing()
      this.checkScalePower()
      this.checkFloatingPower()
      this.checkShotPower()

      this.isPlayerCollidingWithCollisionLayers = false;
      this.isPlayerCollidingHorizontallyWithBox1 = false;
      this.isPlayerCollidingVerticallyWithBox1 = false;
      this.isBox1CollidingWithCollisionLayers = false;
    }
  }
}
