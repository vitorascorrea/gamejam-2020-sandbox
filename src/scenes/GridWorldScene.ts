import Phaser from 'phaser'

export default class GridWorldScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private player?: Phaser.GameObjects.Sprite
  private runKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('gamejam2020');
  }

  preload() {
    this.load.spritesheet('tiles', 'assets/sokoban_tilesheet.png', {
      frameWidth: 64,
      startFrame: 0
    })

    this.cursors = this.input.keyboard.createCursorKeys();
    this.runKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }

  create() {
    this.player = this.physics.add.sprite(400, 400, 'tiles', 54);
    this.createPlayerAnims();
    this.player.body.gameObject.setCollideWorldBounds(true);
  }

  createPlayerAnims() {
    this.anims.create({
      key: 'idle-down',
      frames: [{ key: 'tiles', frame: 52 }]
    })

    this.anims.create({
      key: 'idle-left',
      frames: [{ key: 'tiles', frame: 81 }]
    })

    this.anims.create({
      key: 'idle-right',
      frames: [{ key: 'tiles', frame: 78 }]
    })

    this.anims.create({
      key: 'idle-up',
      frames: [{ key: 'tiles', frame: 55 }]
    })

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('tiles', { start: 81, end: 83 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('tiles', { start: 78, end: 80 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('tiles', { start: 55, end: 57 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('tiles', { start: 52, end: 54 }),
      frameRate: 10,
      repeat: -1
    })
  }

  update() {
    this.checkPlayerMovement();
  }

  checkPlayerMovement() {
    if (!this.cursors || !this.player) {
      return
    }

    let velocity = 160;

    if (this.runKey?.isDown) {
      velocity = 300;
    }

    if (this.cursors.left?.isDown) {
      this.player.anims.play('left', true);
      this.player.body.gameObject.setVelocityX(-1 * velocity);
      this.player.body.gameObject.setVelocityY(0);
    } else if (this.cursors.right?.isDown) {
      this.player.anims.play('right', true);
      this.player.body.gameObject.setVelocityX(velocity);
      this.player.body.gameObject.setVelocityY(0);
    } else if (this.cursors.down?.isDown) {
      this.player.anims.play('down', true);
      this.player.body.gameObject.setVelocityY(velocity);
      this.player.body.gameObject.setVelocityX(0);
    } else if (this.cursors.up?.isDown) {
      this.player.anims.play('up', true);
      this.player.body.gameObject.setVelocityY(-1 * velocity);
      this.player.body.gameObject.setVelocityX(0);
    } else if (this.player?.anims.currentAnim) {
      const key = this.player?.anims.currentAnim?.key;
      this.player.anims.play('idle-' + key);
      this.player.body.gameObject.setVelocity(0);
    }
  }
}
