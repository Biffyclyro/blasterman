import 'phaser';
import LoadingScreen from './core/loading-screen';
import RoomManager from './core/room';

export default class Main extends Phaser.Scene {
  playButton: Phaser.GameObjects.Text;
  title: Phaser.GameObjects.Image;

  constructor() {
    super('Main');
  }

  preload(): void {
    this.load.image('title', 'assets/img/titlescreen.png');
  }

  create(): void {
    this.title = this.add.image(180, 0, 'title')
    .setOrigin(0, 0)
    .setDisplaySize(1000, 500);

    this.playButton = this.add.text(600, 450, 'Play');
    this.playButton.setScale(3, 3);
    this.playButton.setInteractive();
    this.playButton.on('pointerdown', () => {
      this.searchGame();
    });
  }

  searchGame(): void {
    this.scene.start('LoadingScreen');
    this.title.destroy();
    this.playButton.destroy();
  }
}

const config = {
  type: Phaser.CANVAS,
  width:1366,
  height: 768,
  scene: [Main, LoadingScreen, RoomManager],
  physics: {
    default: 'arcade'
  } 
}

const game = new Phaser.Game(config);

game.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
