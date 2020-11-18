import Phaser from 'phaser'

import {
  	Level02Scene,
	Level03Scene,
	Jump01Scene,
	Jump02Scene,
	Jump03Scene,
  	WallJumpScene
} from './scenes'

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
	scene: [Jump01Scene, Jump02Scene, Jump03Scene]

}

export default new Phaser.Game(config)
