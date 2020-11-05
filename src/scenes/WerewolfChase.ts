import Phaser from 'phaser'

export default class WerewolfChase extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private player?: Phaser.GameObjects.Sprite;
  private runKey?: Phaser.Input.Keyboard.Key;
  private playerBody?: Phaser.Physics.Arcade.Body;
  private werewolf?: Phaser.GameObjects.Sprite;
  private werewolfBody?: Phaser.Physics.Arcade.Body;
  private werewolfDetectedPlayer?: boolean = false;

  constructor() {
    super('gamejam2020');
  }

  preload() {
    this.load.spritesheet('tiles', 'assets/sokoban_tilesheet.png', {
      frameWidth: 64,
      startFrame: 0
    });

    this.load.spritesheet('werewolf', 'assets/werewolf.png', {
      frameWidth: 60,
      frameHeight: 47,
      startFrame: 0
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.runKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }

  create() {
    this.player = this.physics.add.sprite(400, 400, 'tiles', 54);
    this.playerBody = this.player.body.gameObject;
    this.createPlayerAnims();
    this.playerBody?.setCollideWorldBounds(true);

    this.cameras.main.startFollow(this.player, true);

    this.werewolf = this.physics.add.sprite(0, 0, 'werewolf', 1);
    this.werewolf.setScale(2);
    this.werewolfBody = this.werewolf.body.gameObject;
    this.createWerewolfAnims();
    this.werewolfBody?.setCollideWorldBounds(true);

    this.physics.add.overlap(this.player.body.gameObject, this.werewolf.body.gameObject, () => {
      this.werewolf?.anims.play('w-idle-down', true);
      this.player?.setTint(0xff0000);
      this.player?.anims.play('idle-down', true);
      this.werewolfDetectedPlayer = false;
      // dead
    });
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

  createWerewolfAnims() {
    this.anims.create({
      key: 'w-idle-down',
      frames: [{ key: 'werewolf', frame: 1 }]
    })

    this.anims.create({
      key: 'w-idle-left',
      frames: [{ key: 'werewolf', frame: 4 }]
    })

    this.anims.create({
      key: 'w-idle-right',
      frames: [{ key: 'werewolf', frame: 7 }]
    })

    this.anims.create({
      key: 'w-idle-up',
      frames: [{ key: 'werewolf', frame: 10 }]
    })

    this.anims.create({
      key: 'w-down',
      frames: this.anims.generateFrameNumbers('werewolf', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'w-left',
      frames: this.anims.generateFrameNumbers('werewolf', { start: 3, end: 5 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'w-right',
      frames: this.anims.generateFrameNumbers('werewolf', { start: 6, end: 8 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'w-up',
      frames: this.anims.generateFrameNumbers('werewolf', { start: 9, end: 11 }),
      frameRate: 10,
      repeat: -1
    })
  }

  update() {
    this.checkPlayerMovement();
    this.checkWerewolfMovement();
  }

  checkWerewolfMovement() {
    if (this.werewolfDetectedPlayer) {
      this.chasePlayer();
    } else if (this.playerBody && this.werewolfBody) {
      this.werewolfBody.setVelocityX(90);
      this.werewolf?.anims.play('w-right', true);
      const distanceBetween = Phaser.Math.Distance.Between(this.playerBody?.x, this.playerBody?.y, this.werewolfBody?.x, this.werewolfBody?.y);
      this.werewolfDetectedPlayer = distanceBetween < 300;
    }
  }

  chasePlayer() {
    if (this.werewolfBody && this.playerBody) {
      this.physics.moveTo(this.werewolf?.body.gameObject, this.playerBody.x, this.playerBody.y, 200);

      if (this.werewolfBody.x - this.playerBody.x < -15) {
        this.werewolf?.anims.play('w-right', true);
      } else if (this.werewolfBody.x - this.playerBody.x > 15) {
        this.werewolf?.anims.play('w-left', true);
      } else if (this.werewolfBody.y - this.playerBody.y < -15) {
        this.werewolf?.anims.play('w-down', true);
      } else if (this.werewolfBody.y - this.playerBody.y > 15) {
        this.werewolf?.anims.play('w-up', true);
      }
    }
  }

  checkPlayerMovement() {
    if (!this.cursors || !this.player) {
      return
    }

    let velocity = 160;

    if (this.runKey?.isDown) {
      velocity = 300;
    }

    const hasKeyPressed = this.cursors.left?.isDown || this.cursors.right?.isDown || this.cursors.up?.isDown || this.cursors.down?.isDown;

    if (hasKeyPressed) {
      if (this.cursors.left?.isDown) {
        this.player.anims.play('left', true);
        this.playerBody?.setVelocityX(-1 * velocity);
      }

      if (this.cursors.right?.isDown) {
        this.player.anims.play('right', true);
        this.playerBody?.setVelocityX(velocity);
      }

      if (!this.cursors.right?.isDown && !this.cursors.left?.isDown) {
        this.playerBody?.setVelocityX(0);
      }

      if (this.cursors.down?.isDown) {
        this.player.anims.play('down', true);
        this.playerBody?.setVelocityY(velocity);
      }

      if (this.cursors.up?.isDown) {
        this.player.anims.play('up', true);
        this.playerBody?.setVelocityY(-1 * velocity);
      }

      if (!this.cursors.up?.isDown && !this.cursors.down?.isDown) {
        this.playerBody?.setVelocityY(0);
      }
    } else if (this.player?.anims.currentAnim) {
      const key = this.player?.anims.currentAnim?.key;
      this.player.anims.play('idle-' + key);
      this.playerBody?.setVelocity(0);
    }
  }
}
