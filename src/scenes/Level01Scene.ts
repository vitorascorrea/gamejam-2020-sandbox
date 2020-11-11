import Phaser from 'phaser'

const [ SCENE_WIDTH, SCENE_HEIGHT ] = [ 30, 20 ];

export class Level01Scene extends Phaser.Scene {
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
    super('level-01');
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

    this.load.spritesheet('dude',
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  create() {
    this.createPlayer();

    const map = this.make.tilemap({ key: 'base_json' });
    const tiles = map.addTilesetImage('ground', 'ground')
    map.createStaticLayer('ground', tiles);

    const collidersTile = map.addTilesetImage('utils', 'utils');
    this.collisionLayers = map.createStaticLayer('colliders', collidersTile);
    this.collisionLayers.setVisible(false);

    this.collisionLayersPlayerCollider = this.physics.add.collider(this.player, this.collisionLayers, () => {
      this.isPlayerCollidingWithCollisionLayers = true;
    });

    this.collisionLayers.setCollisionByProperty({ collides: true });
    this.collisionLayers.getTilesWithin().forEach((tile) => {
      if (tile.properties.canDie) {
        tile.setCollisionCallback(() => {
          this.scene.restart();
        }, this);
      }
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

  checkJump() {
    if (this.cursors.up.isDown && this.canJump) {
      this.jumpCount += 1;
      this.canJump = false
      this.player.setVelocityY(-250);
    }

    if (this.isPlayerCollidingWithCollisionLayers) {
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

      this.checkJump()

      this.isPlayerCollidingWithCollisionLayers = false;
    }
  }
}
