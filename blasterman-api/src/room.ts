import EventEmitter from 'events';
import {Server} from "socket.io";
import {Physics, Action} from './universe';
import {Player, PlayerCommand, Stampable, Movement, World, BattlefieldMap, Direction} from './entities';
import {battleFieldMap} from './utils/engines'


export default class RoomManager {
  private players: Map<string, Player> = new Map();
  private readonly world: World;
  private readonly emitter = new EventEmitter();
  private readonly physics = new Physics(this.updateEntities.bind(this));  
  private readonly VELOCITY = 2.6;
  private readonly serverTime = new Date();
  private readonly serverSocket: Server;
  private readonly roomId: string;
  private readonly battlefieldMap: BattlefieldMap;

  constructor(io: Server, roomId: string, bm: BattlefieldMap){
    this.serverSocket = io;
    this.roomId = roomId;
    this.world = new World(bm);
    this.battlefieldMap = battleFieldMap;
    this.emitter.on('explosion', this.explosionHandler.bind(this));
  }

  addPlayer(p: Player, timestamp: string): void {
    if (!this.players.has(p.playerId) ) {
      p.moves = [];
      p.moves.push({
        timestamp: timestamp,
        moving: false,
        direction: 1
      });
      p.moveSwitch = async (latency: number) => {
        if (p.moves) {
          p.stats!.timestamp = this.serverTime.toISOString();
          setTimeout( p.moves.pop, latency);
        }
      }
      this.emitter.on('move_switch', p.moveSwitch); 
      this.positionChooser(p);
      this.players.set(p.playerId, p); 
      if(this.players.size === 2) {
        this.broadcastRoomReady(this.players);
      }
    }
  }

  private positionChooser(p: Player): void {
    if(p.stats){
      if (this.players.size === 0) {
        p.stats.x = 190;
        p.stats.y = 48;
        p.skin = 'cop';
      } else {
        p.stats.x = 1148;
        p.stats.y = 554;
        p.skin = 'rob';
      }
    }
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId); 
  }

  addMove({playerId, command}: PlayerCommand): void {
    const p = this.players.get(playerId);
    if (p) {
      const movement = (command as Movement);
      const ms = this.latencyCalculator(movement.timestamp, p);
      p.moves!.push(movement);
      this.emitter.emit('move_switch', ms);
      this.broadcastUpdates({playerId: playerId, command: command});
    }
  }

  setBomb(bomb: Stampable, p: Player): void {
    const ms = this.latencyCalculator(bomb.timestamp, p);
    this.world.setDinamite(bomb.x,bomb.y, ms);
    this.broadcastUpdates({playerId: p.playerId, command: bomb});
  }

  private affectedByExplosion(p: Player): void {
    if(this.world.touchExplosion(p.stats!)){
      this.killPlayer(p);
    }
  }

  private explosionHandler(): void {
    this.players.forEach(p => {
      this.affectedByExplosion(p);
    });
  }

  private killPlayer(p: Player): boolean{
    return this.players.delete(p.playerId); 
  }

  private latencyCalculator(t1: string, p: Player ): number {
    const first = new Date(t1); 
    const last = new Date(p.moves![0].timestamp); 
    const clientTimeElapsed = first.getTime() - last.getTime(); 
    const serverTimeElapsed = this.serverTime.getTime() - new Date(p.stats!.timestamp).getTime();
    const latency = clientTimeElapsed - serverTimeElapsed;
    return latency >= 0 ? latency : 0;
  }

  private async movePlayer(p: Player): Promise<void> {

    if(p.moves && p.stats) {
      const move = p.moves[0];
      const x = p.stats.x;
      const y = p.stats.y;
      if(move.moving){
        switch(move.direction) {
          case 1:
            if (!this.world.checkCollision({x:x + 1, y:y})){
              p.stats.x += this.VELOCITY;
            }
            break;
          case 2:
            if (!this.world.checkCollision({x:x - 1, y:y})){
              p.stats.x -= this.VELOCITY;
            }
            break;
          case 3:
            if (!this.world.checkCollision({x:x, y:y + 1})){
              p.stats.y += this.VELOCITY;
            }
            break;
          case 4:
            if (!this.world.checkCollision({x:x, y:y - 1})){
              p.stats.y -= this.VELOCITY;
            }
            break;
        }
       this.affectedByExplosion(p); 
      }
    }
  }
  private async updateEntities(): Promise<void> { 
    this.players.forEach((p: Player) => {
      this.movePlayer(p);
    });
  }

   broadcastUpdates(pc: PlayerCommand): void {
    this.serverSocket.to(this.roomId).emit('command', {data: pc});
  }

  private broadcastRoomReady(playes: Map<string, Player>): void {
    const enterRoomInfo = {
      players: this.players,
      map: this.battlefieldMap
    }
    this.serverSocket.to(this.roomId).emit('room-ready', {info:this.roomId, data: enterRoomInfo});
  }
}
