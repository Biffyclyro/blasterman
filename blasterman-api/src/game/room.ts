import EventEmitter from 'events';
import {Server} from "socket.io";
import {Physics, Action} from './universe';
import {
  Player, 
  PlayerCommand, 
  Stampable, 
  Movement, 
  World, 
  BattlefieldMap, 
  Direction, 
  EnterRoomInfo, 
  Entity, 
  isMovement, 
  Status
} from './entities';
import {
  battleFieldMap, 
  correctEntityPosition, 
  differenceFinder, 
  movementPredictor, 
  verifyPositionTolerance
} from '../utils/engines'
import { ObjectDto } from '../server';


export default class RoomManager {
  players: Map<string, Player> = new Map();
  playersReady = 0;
  private readonly world: World;
  private readonly emitter = new EventEmitter();
  private readonly physics = new Physics(this.updateEntities.bind(this));  
  private readonly VELOCITY = 2.75;
  private readonly serverTime = new Date();
  private readonly serverSocket: Server;
  private readonly roomId: string;
  private readonly battlefieldMap: BattlefieldMap;
  readonly deadPlayers: string[] = [];

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
      p.moveSwitch = async (latency: number) => {
        if (p.moves) {
          p.stats!.timestamp = this.serverTime.toISOString();
          setTimeout( () => {
            p.moves!.shift()
            if (p.moves?.length === 0) {
              p.moves.push({
                timestamp: timestamp,
                moving: false,
                direction: Direction.Down,
                x: p.stats!.x,
                y: p.stats!.y
              });
            }
          }, latency);
        }
      }
      this.emitter.on('move_switch', p.moveSwitch);
      this.positionChooser(p, timestamp);
      p.moves.push({
        timestamp: timestamp,
        moving: false,
        direction: Direction.Down,
        x: p.stats!.x,
        y: p.stats!.y
      });
      this.players.set(p.playerId, p);
    }
  }

  private positionChooser(p: Player, timestamp: string): void {
    const tempStats = {
      x: 0,
      y: 0,
      width: 16,
      height: 22,
      timestamp: timestamp,
      alive: true
    }
    if (this.players.size === 0) {
      tempStats.x = 190;
      tempStats.y = 48;
      p.stats = tempStats;
      p.skin = 'cop';
    } else {
      tempStats.x = 1148;
      tempStats.y = 554;
      p.stats = tempStats;
      p.skin = 'chris';
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
      this.broadcastUpdates({
        playerId: playerId, 
        command: command,
      });
    }
  }

  setBomb(bomb: Stampable, p: Player): void {
    const ms = this.latencyCalculator(bomb.timestamp, p);
    this.world.setDinamite(bomb.x,bomb.y, ms);
    this.broadcastUpdates({
      playerId: p.playerId, 
      command: bomb,
    });
  }

  private affectedByExplosion(p: Player): void {
    if(this.world.touchExplosion(p.stats!)){
      this.serverSocket.emit('player-kill-notification', {data: p.playerId});
      this.killPlayer(p);
    }
  }

  private explosionHandler(): void {
    this.players.forEach(p => {
      this.affectedByExplosion(p);
    });
  }

  private killPlayer(p: Player): boolean {
    this.deadPlayers.push(p.playerId);
    p.stats!.alive = false;
    p.moves!.shift();
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
    if(p.moves && p.stats && p.stats.alive) {
      const move = p.moves[0];
      if(move && isMovement(move) && move.moving){
        /*
        if (verifyPositionTolerance(move.x, p.stats!.x)) {
          p.stats!.x = move.x;
        }
        if (verifyPositionTolerance(move.y, p.stats!.y)) {
          p.stats!.y = move.y;
        }
        */
        correctEntityPosition(move, p.stats!);
        const futurePos = movementPredictor(p.stats, move.direction, this.VELOCITY);
        switch (move.direction) {
          case Direction.Right:

            console.log(this.world.battleField.colliding(futurePos))
            if (!this.world.checkCollision(futurePos)){
              p.stats.x += this.VELOCITY;
            } else {
              const block = this.world.battleField.colliding(futurePos).pop()
              p.stats.x += differenceFinder(p.stats.x, block!.x) - 16 
            }

            break;
          case Direction.Left:

            console.log(this.world.battleField.colliding(futurePos))
            if (!this.world.checkCollision(futurePos)){
              p.stats.x -= this.VELOCITY;
            } else {
              const block = this.world.battleField.colliding(futurePos).pop()
              p.stats.x -= differenceFinder(p.stats.x, block!.x) - 32
            }
            break;
          case Direction.Up:

            console.log(this.world.battleField.colliding(futurePos))
            if (!this.world.checkCollision(futurePos)){
              p.stats.y -= this.VELOCITY;
            } else {
              const block = this.world.battleField.colliding(futurePos).pop()
              p.stats.y -= differenceFinder(p.stats.y, block!.y) - 32
            }
            break;
          case Direction.Down:

            console.log(this.world.battleField.colliding(futurePos))
            if (!this.world.checkCollision(futurePos)){
              p.stats.y += this.VELOCITY;
            } else {
              const block = this.world.battleField.colliding(futurePos).pop()
              p.stats.y += differenceFinder(p.stats.y, block!.y) - 22
            }
            break;
        }

        p.stats.x = Math.round(p.stats.x);
        p.stats.y = Math.round(p.stats.y);
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
    this.serverSocket.to(this.roomId).emit('command', { data: pc });
  }

  playerReady(): void {
    this.playersReady++;
    if(this.playersReady ===2){
      this.broadcastRoomReady(this.players);
    }
  }
  
  getCampo(): Entity[] {
    return this.world.getCampo();
  }

  updatePlayerPosition(requestStatus: Status, playerId: string): void {
    const player = this.players.get(playerId);
    if (player && requestStatus && requestStatus.alive) {
     correctEntityPosition(player.stats!, requestStatus);
    }
  }

  get statusInfo(): {roomId: string, numPlayers: number} {
    return { roomId: this.roomId, numPlayers: this.players.size};
  }

  private broadcastRoomReady(playes: Map<string, Player>): void {
    const enterRoomInfo: EnterRoomInfo = {
      players: [], 
      map: this.battlefieldMap
    }
    this.players.forEach((v, k) => {
      enterRoomInfo.players.push(v);
    });

    //console.log(enterRoomInfo);
    this.serverSocket.to(this.roomId).emit('room-ready', {
      info: this.roomId, 
      data: enterRoomInfo
    });
  }
}