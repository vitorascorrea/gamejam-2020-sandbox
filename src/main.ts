import Phaser from 'phaser'

import {
	MenuScene,
	HelloWorldScene,
	GridWorldScene,
	Level01Scene
} from './scenes'

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
	scene: [ MenuScene, Level01Scene, HelloWorldScene, GridWorldScene ]
}

export default new Phaser.Game(config)
