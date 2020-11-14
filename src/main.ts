import Phaser from 'phaser'

import Level01Scene from './scenes/cave/Level01Scene'
import Level02Scene from './scenes/cave/Level02Scene'
import WallJumpScene from './scenes/cave/WallJumpScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 480,
	height: 320,
	zoom: 2,
	physics: {
		default: 'arcade',
		arcade: {
			debug: true,
			gravity: { y: 300 }
		}
  },
  render: {
		pixelArt: true,
		antialias: false,
	},
	scene: [Level01Scene]

}

export default new Phaser.Game(config)
