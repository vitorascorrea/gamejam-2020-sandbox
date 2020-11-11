import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'
import GridWorldScene from './scenes/GridWorldScene'
import Level01Scene from './scenes/Level01Scene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 400,
	height: 320,
	zoom: 2,
	physics: {
		default: 'arcade',
		arcade: {
		  gravity: { y: 400 }
		}
  },
  render: {
		pixelArt: true,
		antialias: false,
	},
	scene: [Level01Scene]
}

export default new Phaser.Game(config)
