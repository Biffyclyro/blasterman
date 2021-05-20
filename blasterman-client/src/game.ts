import 'phaser';

export default class Main extends Phaser.Scene {
  private title;
  private playButton;
  private playerId: string;

  constructor() {
    super('Main');
  }

  preload(): void {
    this.load.image('title', 'assets/img/titlescreen.png');

    ConnectionService.instance.connectPlayer().then(r => {
      this.playerId = r
    });
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
    this.scene.start('LoagindScreen');
    this.playButton.destroy();
    this.title.destroy();
  }
}

const config = {
  type: Phaser.CANVAS,
  width:1366,
  height: 768,
  scene: [Main, LoagindScreen, Room],
  physics: 'arcade'
}

const game = new Phaser.Game(config);

game.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
