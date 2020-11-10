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
  collisionLayersCollider!: Phaser.Physics.Arcade.Collider;
  isCollidingWithCollisionLayers: boolean = false;

  private collisionLayers?: Phaser.Tilemaps.StaticTilemapLayer

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

    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
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

    this.collisionLayersCollider = this.physics.add.collider(this.player, this.collisionLayers, () => {
      this.isCollidingWithCollisionLayers = true;
    });

    this.collisionLayers.setCollisionByProperty({ collides: true, collidesDown: true });
    this.collisionLayers.getTilesWithin().forEach((tile) => tile.collideDown = !tile.properties.collidesDown);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.physics.world.setBounds(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    this.cameras.main.setBounds(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

    this.physics.add.collider(this.player, this.bombs);
    this.cameras.main.startFollow(this.player, false, 0.5, 0.5, 0, 150);
  }

  createPlayer() {
    this.player = this.physics.add.sprite(100, 450, 'dude');
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

  doubleJump() {
    if (this.cursors.up.isDown && this.canJump) {
      this.jumpCount += 1;
      this.canJump = false
      this.player.setVelocityY(-250);
    }

    if (this.isCollidingWithCollisionLayers) {
      this.jumpCount = 0;
      this.canJump = true
    }

    if (this.cursors.up.isUp && this.jumpCount <= 1) {
      this.canJump = true
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

      this.doubleJump()

      this.isCollidingWithCollisionLayers = false;
    }
  }
}
