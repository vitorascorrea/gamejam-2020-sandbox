import Phaser from 'phaser'

const [ SCENE_WIDTH, SCENE_HEIGHT ] = [ 3000, 1200 ];

export default class HelloWorldScene extends Phaser.Scene {
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

  collisionLayers?: Phaser.Tilemaps.StaticTilemapLayer
  collisionLayersBox1Collider!: Phaser.Physics.Arcade.Collider;
  playerBox1Collider!: Phaser.Physics.Arcade.Collider;
  aKey!: Phaser.Input.Keyboard.Key;
  sKey!: Phaser.Input.Keyboard.Key;
  dKey!: Phaser.Input.Keyboard.Key;
  wKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('gamejam2020');
  }

  preload() {
    this.load.tilemapTiledJSON('cave_tilemap', 'assets/platform/cave_tilemap.json')
		this.load.spritesheet('brown_tile', 'assets/platform/brown_tile.png', {
			frameWidth: 16,
      startFrame: 0
    })

		this.load.spritesheet('utils', 'assets/platform/utils.png', {
			frameWidth: 16,
      startFrame: 0
    })

    this.load.spritesheet('box1', 'assets/platform.png', {
      frameWidth: 16,
      startFrame: 0
    });

    this.load.spritesheet('dude',
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  create() {
    this.createPlayer();

    const map = this.make.tilemap({ key: 'cave_tilemap' });
    const tiles = map.addTilesetImage('brown_tile', 'brown_tile');
    map.createStaticLayer('ground', tiles);

    const collidersTile = map.addTilesetImage('utils', 'utils');
    this.collisionLayers = map.createStaticLayer('colliders', collidersTile);
    this.collisionLayers.setVisible(false);

    this.collisionLayersPlayerCollider = this.physics.add.collider(this.player, this.collisionLayers, () => {
      this.isPlayerCollidingWithCollisionLayers = true;
    });

    this.collisionLayers.setCollisionByProperty({ collides: true, collidesDown: true });
    this.collisionLayers.getTilesWithin().forEach((tile) => tile.collideDown = !tile.properties.collidesDown);

    this.box1 = this.physics.add.sprite(50, 240, 'box1');
    this.box1.setDrag(Infinity, 0);

    this.collisionLayersBox1Collider = this.physics.add.collider(this.box1, this.collisionLayers, () => {
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
    this.player = this.physics.add.sprite(0, 0, 'dude');
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

  checkJump() {
    if (this.cursors.up.isDown && this.canJump) {
      this.jumpCount += 1;
      this.canJump = false
      this.player.setVelocityY(-350);
    }

    if (this.isPlayerCollidingWithCollisionLayers || this.isPlayerCollidingHorizontallyWithBox1) {
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
        this.player.setVelocityX(-160);
        this.player.anims.play('left', true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
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
