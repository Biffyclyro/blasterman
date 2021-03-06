import 'phaser';
import WebSocketService from '../services/websocket-service';
import {loading, clientDate} from '../utils/engines';
import {EnterRoomInfo, ObjectDto, ServerPlayer} from '../entities';

export default class LoadingScreen extends Phaser.Scene {
  private readonly socket = WebSocketService.INSTANCE;
  infos: EnterRoomInfo;
  localPlayerId: string;
  
  constructor() {
    super('LoadingScreen');
  }
  
  init(data:{roomId: string}): void {
    loading(this);
    const enterRequest: ObjectDto<string> = {
      data: clientDate.toISOString()
    };
    if(data.roomId !== '') {
      enterRequest.info = data.roomId;
    }
    this.socket.emit('enter-room', enterRequest);
    this.socket.on('message', (res: ObjectDto<string>) => {
      if (res.info !== 'update-state') {
        this.localPlayerId = res.data!;
        this.urlBuilder(res.info!);
        this.socket.emit('ok', { info: res.info! });
      }
    });
  }

  create(): void {
    this.socket.on('room-ready', (res: ObjectDto<EnterRoomInfo>) => {
      this.infos = res.data!;
      this.infos.roomId = res.info!;
      this.infos.playerId = this.localPlayerId;
      this.runGame();
    }); 
  }

  private runGame(): void {
    this.scene.start('Room', this.infos);
  }

  private urlBuilder(roomID: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomID);
    window.history.pushState({}, '', url.href);
  }
}