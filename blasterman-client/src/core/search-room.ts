import 'phaser';

export default class SearchScreen extends Phaser.Scene {

  constructor() {
    super('SearchScreen');
  }
  
  
  create(): void {
		this.add.text(500, 100, 'Partidas em andamento').setScale(1.5,1.5);	
		this.add.text(500, 200, 'Sala 1......................1/2');	
		this.add.text(500, 250, 'Sala 2......................2/2');	
		this.add.text(500, 300, 'Sala 2......................2/2');	
		this.add.text(500, 350, 'Sala 2......................2/2');	
  }

	private goToRoom(roomId: number): void {
		this.scene.start('LoadingScreen', { roomId: roomId });
	}
}