import Phaser from 'phaser'

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super('hello-world');
    this.platforms = null;
    this.player = null;
    this.cursors = null;
    this.stars = null;
    this.score = 0;
    this.scoreText = null;
    this.bombs = null;
    this.jumpCount = 0;
    this.canJump = true;
  }

  preload() {
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
    this.add.image(400, 300, 'sky');

    this.platforms = this.physics.add.staticGroup();
    const ground = this.platforms.create(400, 568, 'ground');

    ground.setScale(2, 1).refreshBody();

    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
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

    this.player.setGravityY(300);
    this.physics.add.collider(this.player, this.platforms);
    this.cursors = this.input.keyboard.createCursorKeys();

    // this.stars = this.physics.add.group({
    //   key: 'star',
    //   repeat: 11,
    //   setXY: { x: 12, y: 0, stepX: 70 }
    // });

    // this.stars.children.iterate((child) => {
    //   child.body.gameObject.setBounce(Phaser.Math.FloatBetween(0.4, 0.8));
    // });

    // this.physics.add.collider(this.stars, this.platforms);
    // this.physics.add.overlap(this.player, this.stars, (player, star) => {
    //   star.body.gameObject.disableBody(true, true);
    //   this.score += 10;
    //   this.scoreText.setText('score: ' + this.score);

    //   if (this.stars.countActive(true) === 0) {
    //     this.stars.children.iterate(function (child) {
    //       child.body.gameObject.enableBody(true, child.body.gameObject.x, 0, true, true);
    //     });

    //     var x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    //     var bomb = this.bombs.create(x, 16, 'bomb');
    //     bomb.setBounce(1);
    //     bomb.setCollideWorldBounds(true);
    //     bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    //   }


    // }, null, this);

    // this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    // this.bombs = this.physics.add.group();
    // this.physics.add.collider(this.bombs, this.platforms);
    // this.physics.add.collider(this.player, this.bombs, (player) => {
    //   this.physics.pause();
    //   player.body.gameObject.setTint(0xff0000);
    //   player.body.gameObject.anims.play('turn');
    // }, null, this);
  }

  doubleJump() {
    if (this.cursors.up.isDown && this.canJump) {
      this.jumpCount += 1;
      this.canJump = false
      this.player.setVelocityY(-430);
    }

    if (this.player.body.touching.down) {
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
