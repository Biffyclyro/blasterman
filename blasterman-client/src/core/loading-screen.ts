import 'phaser';
import {loading} from '../utils/engines';
import {Player} from '../entities';
import {RoomManager} from '../core/room';

export class LoagindScreen extends Phaser.Scene {
  readonly socket = WebSocketService.getInstance();
  infos: EnterRoomInfo;
  localPlayer: Player;

  constructor() {
    super('LoagindScreen');
  }
  
  init(): void {
    loading(this);
    socket.emit('enter-room');
    socket.on('enter-room', (res: ObjectDto<ServerPlayer>) => {
      this.localPlayer = res.data; 
    });
  }

  create(): void {
    socket.on('room-ready', (res: ObjectDto<EnterRoomInfo>) => {
      this.infos = res.data;
      this.infos.player = this.localPlayer;
      this.runGame();
    }); 
  }

  private runGame(): void {
    this.scene.start('Room', this.infos);
  }
}
