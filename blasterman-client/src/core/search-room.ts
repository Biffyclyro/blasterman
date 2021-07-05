import 'phaser';
import { ConnectionService } from '../services/http-service';

export default class SearchScreen extends Phaser.Scene {
	private backButton: Phaser.GameObjects.Text;
	private title: Phaser.GameObjects.Text;
	private rooms: Phaser.GameObjects.Text[] = [];
	private activeRooms: {roomId: string, numPlayers: number}[];
	private readonly httpC = new ConnectionService(); 

  constructor() {
    super('SearchScreen');
	}

	create(): void {
		this.httpC.getRoomList().then(d => {
			this.activeRooms = d;
			let positionY = 200;
			this.title = this.add.text(500, 100, 'Partidas em andamento').setScale(1.5, 1.5);
			console.log(this.activeRooms);
			this.activeRooms.forEach(ar => {
				const activeRoom = this.add.text(500, positionY, `${this.activeRooms.indexOf(ar) + 1}......................${ar.numPlayers}/2`);
				activeRoom.setInteractive();
				activeRoom.on('pointerdown', () => {
					return;
				});
				this.rooms.push(activeRoom);
				positionY += 50;
			});

		});
	/*	this.rooms.push(this.add.text(500, 200, 'Sala 1......................1/2'));
		this.rooms.push(this.add.text(500, 250, 'Sala 2......................2/2'));
		this.rooms.push(this.add.text(500, 300, 'Sala 3......................2/4'));
		this.rooms.push(this.add.text(500, 350, 'Sala 4......................1/4'));
		*/	
		this.backButton = this.add.text(200, 700, '<- Voltar');
		this.backButton.setInteractive();
		this.backButton.on('pointerdown', () => {
			this.backToTitle();
		});
  }

	private destroyAll(): void {
		this.title.destroy();
		this.backButton.destroy();
		this.rooms.forEach(r => r.destroy());
	}

	private goToRoom(roomId: number): void {
		this.scene.start('LoadingScreen', { roomId: roomId });
		this.destroyAll();
	}

	private backToTitle(): void {
		this.scene.start('Main');
		this.destroyAll();
	}
}