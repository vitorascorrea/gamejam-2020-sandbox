import Phaser, { Tilemaps } from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor () {
    super('menu');
  }

  create () {
    this.game.scene.getScenes(false).forEach((scene, i) => {
        const sceneName = scene.sys.config.toString();
        const text = this.add.text(100,100 + (i * 20), sceneName);
        text.setInteractive({ useHandCursor: true });
        text.on('pointerdown', () => this.scene.switch(sceneName));
    });
  }
}