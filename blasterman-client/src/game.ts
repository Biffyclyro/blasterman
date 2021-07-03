import 'phaser';
import LoadingScreen from './core/loading-screen';
import RoomManager from './core/room';
import SearchScreen from './core/search-room';

export default class Main extends Phaser.Scene {
  playButton: Phaser.GameObjects.Text;
  serachButton: Phaser.GameObjects.Text;
  title: Phaser.GameObjects.Image;
  url = window.location; 

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

    this.serachButton = this.add.text(500, 510, 'Buscar Sala');
    this.serachButton.setScale(3,3);
    this.serachButton.setInteractive();
    this.serachButton.on('pointerdown', () => {
      this.searchRoom();
    });
  }

  searchRoom():void {
    this.scene.start('SearchScreen');
    this.title.destroy();
    this.playButton.destroy();
    this.serachButton.destroy();
  }

  searchGame(): void {
    let roomId = ''; 
    if(this.url.search.slice(1)){ roomId = this.url.search.slice(6)}
    this.scene.start('LoadingScreen', {roomId: roomId});
    this.title.destroy();
    this.playButton.destroy();
    this.serachButton.destroy();
  }
}

const config = {
  type: Phaser.CANVAS,
  width: 1366,
  height: 768,
  scene: [Main, LoadingScreen, RoomManager, SearchScreen],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  } 
}

export const game = new Phaser.Game(config);