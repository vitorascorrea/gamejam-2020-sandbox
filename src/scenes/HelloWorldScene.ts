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
  colidindoComAMerdaDoChao!: Phaser.Physics.Arcade.Collider;

  private groundLayer?: Phaser.Tilemaps.StaticTilemapLayer
  private colliderLayers?: Phaser.Tilemaps.StaticTilemapLayer

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

    const map = this.make.tilemap({ key: 'cave_tilemap' });
    const tiles = map.addTilesetImage('brown_tile', 'brown_tile');
    this.groundLayer = map.createStaticLayer('ground', tiles);

    const collidersTile = map.addTilesetImage('utils', 'utils');
    this.colliderLayers = map.createStaticLayer('colliders', collidersTile);
    this.colliderLayers.setVisible(false);

    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    
    this.colidindoComAMerdaDoChao = this.physics.add.collider(this.player, this.colliderLayers);

    this.colliderLayers.setCollisionByProperty({ collides: true, collidesDown: true });
    
    this.colliderLayers.getTilesWithin().forEach((tile) => tile.collideDown = !tile.properties.collidesDown);

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

    this.player.setGravityY(300);
    this.physics.add.collider(this.player, this.platforms);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.stars.children.iterate((child) => {
      child.body.gameObject.setBounce(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(this.stars, this.platforms);

    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.overlap(this.player, this.stars, (player, star) => {
      star.body.gameObject.disableBody(true, true);
      this.score += 10;
      this.scoreText.setText('score: ' + this.score);

      if (this.stars.countActive(true) === 0) {
        this.stars.children.iterate(function (child) {
          child.body.gameObject.enableBody(true, child.body.gameObject.x, 0, true, true);
        });

        var x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      }
    });

    this.physics.world.setBounds(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    this.cameras.main.setBounds(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

    this.physics.add.collider(this.player, this.bombs);
    this.cameras.main.startFollow(this.player, false, 0.5, 0.5, 0, 150);


    // start collisions

    //map.setCollisionBetween(1, 999, true, undefined, this.colliderLayers);


    //this.colliderLayers.setCollision([0]);


   // this.physics.add.collider(this.player, this.colliderLayers);


  }

  doubleJump() {
    if (this.cursors.up.isDown && this.canJump) {
      this.jumpCount += 1;
      this.canJump = false
      this.player.setVelocityY(-430);
    }

    if (this.colidindoComAMerdaDoChao.active) {
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
    }
  }
}
