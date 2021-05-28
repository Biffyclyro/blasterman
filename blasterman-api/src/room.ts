import EventEmitter from 'events';
import {Server} from "socket.io";
import {Physics, Action} from './universe';
import {Player, PlayerCommand, Stampable, Movement, World, BattlefieldMap, Direction, EnterRoomInfo, Entity} from './entities';
import {battleFieldMap, movementPredictor} from './utils/engines'


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
        direction: Direction.Down
      });
      p.moveSwitch = async (latency: number) => {
        if (p.moves) {
          p.stats!.timestamp = this.serverTime.toISOString();
          setTimeout( () => {
            p.moves!.shift()
            if (p.moves?.length === 0) {
              p.moves.push({
                timestamp: timestamp,
                moving: false,
                direction: Direction.Down
              })
            }
          }, latency);
        }
      }
      this.emitter.on('move_switch', p.moveSwitch); 
      this.positionChooser(p, timestamp);
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
      if(move && move.moving){
        const futurePos = movementPredictor(p.stats, move.direction, this.VELOCITY);
        console.log(futurePos)
        switch(move.direction) {
          case Direction.Right:

            console.log(this.world.battleField.colliding(futurePos))
            if (!this.world.checkCollision({x:x + this.VELOCITY, y:y, width: 16, height: 22})){
              p.stats.x += this.VELOCITY;
            }
            break;
          case Direction.Left:

            console.log(this.world.battleField.colliding(futurePos))
            if (!this.world.checkCollision({x:x - this.VELOCITY, y:y, width: 16, height: 22})){
              p.stats.x -= this.VELOCITY;
            }
            break;
          case Direction.Up:

            console.log(this.world.battleField.colliding(futurePos))
            if (!this.world.checkCollision({x:x, y:y - this.VELOCITY, width: 16, height: 22})){
              p.stats.y -= this.VELOCITY;
            }
            break;
          case Direction.Down:

            console.log(this.world.battleField.colliding(futurePos))
            if (!this.world.checkCollision({x:x, y:y + this.VELOCITY, width: 16, height: 22})){
              p.stats.y += this.VELOCITY;
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

  playerReady(): void {
    this.playersReady++;
    if(this.playersReady ===2){
      this.broadcastRoomReady(this.players);
    }
  }
  
  getCampo(): Entity[] {
    return this.world.getCampo();
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
