import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'
import GridWorldScene from './scenes/GridWorldScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
  height: 400,
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
	scene: [HelloWorldScene]
}

export default new Phaser.Game(config)
