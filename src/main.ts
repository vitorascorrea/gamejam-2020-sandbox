import Phaser from 'phaser'

import Level01Scene from './scenes/cave/Level01Scene'
import Level02Scene from './scenes/cave/Level02Scene'
import WallJumpScene from './scenes/cave/WallJumpScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1920 / 5,
	height: 1080 / 5,
	scale: {
        mode: Phaser.Scale.ZOOM_2X,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
	physics: {
		default: 'arcade',
		arcade: {
			debug: true,
			gravity: { y: 400 }
		}
  },
  render: {
		pixelArt: true,
		antialias: false,
	},
	scene: [WallJumpScene]

}

export default new Phaser.Game(config)
