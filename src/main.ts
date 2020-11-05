import Phaser from 'phaser'

import { 
	HelloWorldScene,
	SokobanScene
} from './scenes'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	width: 320,
	height: 320,
	zoom: 2,
	render: {
		pixelArt: true,
		antialias: false,
	},
	physics: {
		default: 'arcade',
		arcade: {
			// gravity: { y: 200 }
		}
	},
	scene: [SokobanScene]
}

export default new Phaser.Game(config)
