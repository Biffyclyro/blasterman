import {Physics, Action} from './universe';
import {Player, PlayerCommand, Stampable, Movement, World} from './entities';


export default class RoomManager {
  private players: Map<string, Player>;
  private readonly physics: Physics;
  private readonly world: World;
  private readonly VELOCITY: number;
  private readonly serverTime = new Date();

  constructor() {
    this.players = new Map();
    this.physics = new Physics(this.updateEntities); 
    this.world = new World();
    this.VELOCITY = 2.6;
  }

  addPlayers(p: Player): void {
    if (!this.players.has(p.playerId) ) {
      p.moves = [];
      p.moveSwitch = async (latency: number) => {
        if (p.moves) {
          setTimeout( p.moves.pop, latency);
        }
      }
      p.on('move_switch', p.moveSwitch); 
      this.players.set(p.playerId, p); 
    }
  }

  addMove({playerId, command}: PlayerCommand): void {
    const p = this.players.get(playerId);
    if (p) {
      const movement = (command as Movement);
      p.moves!.push(movement);
      const ms = this.latencyCalculator(movement.timestamp);

      p.emit('move_switch', ms);

    }
  }

  setBomb({x, y, timestamp}: Stampable): void {
    const ms = this.latencyCalculator(timestamp);
    this.world.setDinamite(x,y, ms);
  }

  latencyCalculator(timestamp: string): number {
    const clientTime = new Date(timestamp); 
    return this.serverTime.getTime() - clientTime.getTime(); 
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
}
