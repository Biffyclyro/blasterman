import 'phaser';
import { API_URL, CLIENT_URL } from "../../../shared/common";

export default class EndMatchScreen extends Phaser.Scene {
	private skin: string;
	private finalText: string;
	private title: Phaser.GameObjects.Text;
	private backButton: Phaser.GameObjects.Text;
	private victorious: Phaser.Physics.Arcade.Sprite;

	constructor() {
		super('EndMatchScreen');
	}

	init(data: { skin: string }): void {
		this.skin = data.skin;
	}

	preload(): void {
		let pathToTexture: string;

		if (this.skin === 'dinamite') {
			pathToTexture = './assets/dinamite.png';
			this.finalText = 'Empate';
		} else {
			pathToTexture = `${API_URL}/characters/${this.skin}.png`;
			this.finalText = 'Vencedor da partida';
		}

		this.load.spritesheet(this.skin, pathToTexture, {
			frameHeight: 32,
			frameWidth: 32
		});
	}

	create(): void {
		
		this.title = this.add.text(600, 100, this.finalText).setScale(1.5, 1.5);

		this.anims.create({
			key: 'victorious',
			frames: this.anims.generateFrameNumbers(this.skin, { start: 8, end: 11 }),
			frameRate: 10,
			repeat: 0
		});

		this.victorious = this.physics.add.sprite(700, 300, 'victorious');
		this.victorious.setScale(5, 5);

		this.backButton = this.add.text(200, 700, '<- Voltar');
		this.backButton.setInteractive();
		this.backButton.on('pointerdown', () => {
			this.backToHome();
		});

		setTimeout(() => this.backToHome(), 5000);
	}

	update(): void {
		this.victorious.play('victorious', true);
	}

	private backToHome(): void {
		this.destroyAll();
		window.location.href = CLIENT_URL;
	}

	private destroyAll(): void {
		this.victorious.destroy();
		this.backButton.destroy();
		this.title.destroy();
	}
}