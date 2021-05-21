import 'phaser';
import WebSocketService from '../services/websocket-service';
import {loading} from '../utils/engines';
import {EnterRoomInfo, ObjectDto, ServerPlayer} from '../entities';
import RoomManager from '../core/room';

export default class LoadingScreen extends Phaser.Scene {
  readonly socket = WebSocketService.getInstance();
  infos: EnterRoomInfo;
  localPlayer: ServerPlayer;

  constructor() {
    super('LoadingScreen');
  }
  
  init(): void {
    loading(this);
    this.socket.emit('enter-room');
    this.socket.on('enter-room', (res: ObjectDto<ServerPlayer>) => {
      this.localPlayer = res.data!; 
    });
  }

  create(): void {
    this.socket.on('room-ready', (res: ObjectDto<EnterRoomInfo>) => {
      this.infos = res.data!;
      this.infos.player = this.localPlayer;
      this.runGame();
    }); 
  }

  private runGame(): void {
    this.scene.start('Room', this.infos);
  }
}
