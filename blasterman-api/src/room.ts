import {Physics, Action} from './universe';
import {Player, PlayerCommand, Stampable, Movement, World} from './entities';


export default class RoomManager {
  private players: Map<string, Player> = new Map();
  private readonly physicso = new Physics(this.updateEntities);  
  private readonly world = new World();
  private readonly VELOCITY = 2.6;
  private readonly serverTime = new Date();


  addPlayers(p: Player): void {
    if (!this.players.has(p.playerId) ) {
      p.moves = [];
      p.moveSwitch = async (latency: number) => {
        if (p.moves) {
          p.stats!.timestamp = this.serverTime.toISOString();
          setTimeout( p.moves.pop, latency);
        }
      }
      p.on('move_switch', p.moveSwitch); 
      this.players.set(p.playerId, p); 
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
      p.emit('move_switch', ms);
      this.broadCastUpdates({playerId: playerId, command: command});
    }
  }

  setBomb(bomb: Stampable, p: Player): void {
    const ms = this.latencyCalculator(bomb.timestamp, p);
    this.world.setDinamite(bomb.x,bomb.y, ms);
    this.broadCastUpdates({playerId: p.playerId, command: bomb});
  }

  private latencyCalculator(t1: string, p: Player ): number {
    const first = new Date(t1); 
    const last = new Date(p.moves![0].timestamp); 
    const clientTimeElapsed = first.getTime() - last.getTime(); 
    const serverTimeElapsed = this.serverTime.getTime() - new Date(p.stats.timestamp).getTime();
    const latency = clientTimeElapsed - serverTimeElapsed;

    return latency >= 0 ? latency : 0;
  }

  async movePlayers(p: Player): Promise<void> {

    if(p.moves && p.stats) {
      const move = p.moves[0];
      const x = p.stats.x;
      const y = p.stats.y;

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
    }
  }
  async updateEntities(): Promise<void> { 
    this.players.forEach( (p: Player) => {
      this.movePlayers(p);
    });
  }

  broadCastUpdates(pc: PlayerCommand): void {
    
  }
}
