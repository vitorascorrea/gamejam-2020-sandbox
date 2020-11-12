import Phaser from 'phaser'

import Level01Scene from './scenes/Level01Scene'
import Level02Scene from './scenes/Level02Scene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 480,
	height: 320,
	zoom: 2,
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
	scene: [Level02Scene]
}

export default new Phaser.Game(config)
