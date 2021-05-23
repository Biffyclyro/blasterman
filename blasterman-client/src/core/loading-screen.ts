import 'phaser';
import WebSocketService from '../services/websocket-service';
import {loading, clientDate} from '../utils/engines';
import {EnterRoomInfo, ObjectDto, ServerPlayer} from '../entities';
import RoomManager from '../core/room';

export default class LoadingScreen extends Phaser.Scene {
  private readonly socket = WebSocketService.getInstance();
  infos: EnterRoomInfo;
  localPlayer: ServerPlayer;
  

  constructor() {
    super('LoadingScreen');
  }
  
  init(data:{roomId: string}): void {
    loading(this);
    const enterRequest: ObjectDto<string> = {data: clientDate.toISOString()};
    console.log(data.roomId);
    if(data.roomId !== '') {
      enterRequest.info = data.roomId;
    }
    this.socket.emit('enter-room', enterRequest);
    this.socket.on('message', (res: ObjectDto<ServerPlayer>) => {
      this.localPlayer = res.data!; 
      const url = new URL(window.location.href);
      url.searchParams.set('room', res.info!);
      window.history.pushState({}, '', url.href);
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
