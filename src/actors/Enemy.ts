import { DirectionEnum } from "../enum";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  dir!: DirectionEnum
  velocity: number

  constructor(scene: Phaser.Scene, x, y, texture, group, dir: DirectionEnum = DirectionEnum.LEFT) {
    super(scene, x, y, texture);
    this.dir = dir;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    group.add(this);
    this.setSize(16, 16).setOffset(8, 16);
    this.anims.play('fire_monster_walking');
    this.velocity = 30;
    scene.events.on('update', () => this.update());
    if(this.dir === DirectionEnum.LEFT) {
      this.velocity *= - 1;
    }
    this.flipX = this.velocity < 0;
    this.setVelocityX(this.velocity);
    this.setGravityY(400);
    scene.time.addEvent({ delay: Phaser.Math.Between(8000, 10000), callback: () => this.die(), callbackScope: this});
  }

  die() {
    this.body.destroy()
    this.anims.play('fire_monster_dying')
    this.velocity = 0;
    this.body.velocity.x = 0;
    this.on('animationcomplete', () => this.destroy())

  }

  update() {
    super.update();
    if(this.body?.velocity.x == 0 && this.body?.velocity.y == 0) {
        this.body.velocity.x = this.velocity * -1;
        this.flipX = this.velocity > 0;
        this.velocity = this.body.velocity.x;
      }
  }
}