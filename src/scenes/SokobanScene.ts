export class SokobanScene extends Phaser.Scene {
  private layer?: Phaser.Tilemaps.StaticTilemapLayer

  constructor() {
    super({
      key: "Sokoban"
    });
  }

  preload(): void {
		this.load.tilemapTiledJSON('sokoban_tilesheet', 'assets/levels/sokoban_tilemap.json')
		this.load.spritesheet('tiles', 'assets/levels/sokoban_tilesheet.png', {
			frameWidth: 16,
      startFrame: 0
		})

  }

  create(): void {
    const map = this.make.tilemap({ key: 'sokoban_tilesheet' });
    const tiles = map.addTilesetImage('sokoban_tilesheet', 'tiles');
    this.layer = map.createStaticLayer('level', tiles, 0, 0);
  }
}