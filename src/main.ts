import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'
import GridWorldScene from './scenes/GridWorldScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			// gravity: { y: 200 }
		}
	},
	scene: [GridWorldScene]
}

export default new Phaser.Game(config)
