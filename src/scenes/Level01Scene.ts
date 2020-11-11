import Phaser from 'phaser'

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

  collisionLayers?: Phaser.Tilemaps.StaticTilemapLayer
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
      { frameWidth: 24, frameHeight: 24 }
    )
  }

  create() {
    this.createPlayer();
    this.createFireElemental();
    this.fireElemental.anims.play('walking')
    this.fireElemental.setVelocityX(10);

    const map = this.make.tilemap({ key: 'base_json' });
    const tiles = map.addTilesetImage('ground', 'ground')
    map.createStaticLayer('ground', tiles);

    const collidersTile = map.addTilesetImage('utils', 'utils');
    this.collisionLayers = map.createStaticLayer('colliders', collidersTile);
    this.collisionLayers.setVisible(false);

    this.collisionLayersPlayerCollider = this.physics.add.collider(this.player, this.collisionLayers, (player, tile: any) => {
      if (tile.properties.canDie) {
        tile.setCollisionCallback(() => {
          this.scene.restart();
        }, this);
      }
      this.isPlayerCollidingWithCollisionLayers = true;
    });

    this.collisionLayersFireElementalCollider = this.physics.add.collider(this.fireElemental, this.collisionLayers);

    this.collisionLayers.setCollisionByProperty({ collides: true });
    this.spikeGroup = this.physics.add.staticGroup();

    // map.forEachTile((tile) => {
    //   if (tile.properties.canDie) {
    //     const x = tile.getCenterX();
    //     const y = tile.getCenterY();
    //     const spike = this.spikeGroup.create(x, y, "spike");

    //     // The map has spike tiles that have been rotated in Tiled ("z" key), so parse out that angle
    //     // to the correct body placement
    //     spike.rotation = tile.rotation;
    //     if (spike.angle === 0) spike.body.setSize(32, 6).setOffset(0, 26);
    //     else if (spike.angle === -90) spike.body.setSize(6, 32).setOffset(26, 0);
    //     else if (spike.angle === 90) spike.body.setSize(6, 32).setOffset(0, 0);

    //     // And lastly, remove the spike tile from the layer
    //     // this.collisionLayers.removeTileAt(tile.x, tile.y);
    //   }
    // })

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

  createPlayer() {
    this.player = this.physics.add.sprite(15, 260, 'dude').setScale(0.5);
    // this.player.setCollideWorldBounds(true);

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

  createFireElemental() {
    this.fireElemental = this.physics.add.sprite(15, 0, 'fire_monster');
    // this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'walking',
      frames: this.anims.generateFrameNumbers('fire_monster', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.fireElemental.setGravityY(400);
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
