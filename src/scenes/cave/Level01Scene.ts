import Phaser from 'phaser';
import BaseScene from './BaseScene';

export default class Level01Scene extends BaseScene {
  constructor() {
    super('level_01_scene', 'level_02_scene', 'level_01');
  }
}