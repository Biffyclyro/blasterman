import {Physics, Action} from './universe';
import {QuadTree, Box, Point, Circle} from 'js-quadtree';
import {Player, PlayerCommand, Dinamite, Pos, Movement} from './entities';


export default class RoomManager {
  private players: Map<string, Player>;
  private readonly physics: Physics;
  private readonly battleField: QuadTree;
  private readonly VELOCITY: number;
    

  constructor() {
    this.players = new Map();
    this.physics = new Physics(this.updateEntities); 
    this.battleField = new QuadTree(new Box(0, 0, 31, 17));
    this.VELOCITY = 0.8125;
  }

  addPlayers(p: Player): void {
    if (!this.players.has(p.playerId) ) {
      p.moves = [];
      p.moveSwitch = async (time: number) => {
        if (p.moves) {
          setTimeout( p.moves.pop, time);
        }
      }
      p.on('move_switch', p.moveSwitch); 
      this.players.set(p.playerId, p); 
      
    }
  }
 
  addMove({playerId, command}: PlayerCommand): void {
    const p = this.players.get(playerId);
    if (p) {
      p.moves!.push((command as Movement));
      p.emit('move_switch');
      
    }
  }

  findEntity(x:number, 
             y:number, 
             width: number = 1, 
             height: number = 1): boolean {

    return this.battleField
                 .query(new Box(x, y, width, height)) === undefined;
  }

  setBomb({pos, timestamp}: {pos: Pos, timestamp: string}): void {
    let dinamite: Dinamite | null;

    setTimeout(() => {
      if (!this.findEntity(pos[0], pos[1])) {
        dinamite = new Dinamite(pos, timestamp);

        this.battleField.insert(new Point(pos[0], pos[1], dinamite));

        dinamite.on('explode', (d: Dinamite) => {
          if (d === dinamite ){ 
            dinamite = null
          }
        });

      }
    }, 40);
  }

  async movePlayers(p: Player): Promise<void> {
    
    if(p.moves && p.stats) {
        const move = p.moves[0];
        const pos = p.stats.pos;
        this.battleField.remove(new Point(pos[0],pos[1]));

        switch(move.direction) {
          case 1:
            if (!this.findEntity(pos[0] + 1, pos[1])){
              p.stats.pos[0] += this.VELOCITY;
            }
            break;
          case 2:
            if (!this.findEntity(pos[0] - 1, pos[1])){
              p.stats.pos[0] -= this.VELOCITY;
            }
            break;
          case 3:
            if (!this.findEntity(pos[0] , pos[1] + 1)){
              p.stats.pos[1] += this.VELOCITY;
            }
            break;
          case 4:
            if (!this.findEntity(pos[0], pos[1] - 1)){
              p.stats.pos[1] -= this.VELOCITY;
            }
            break;
        }

        this.battleField.insert(new Point(pos[0], pos[1]));
      }
  }

  addEntity(x: number, y: number, data?: object): void {
    if(!this.findEntity(x,y)){
      this.battleField.insert(new Point(x, y, data));
    }
  }

  removeEntity(x: number, y: number): void {
    if(this.findEntity(x,y)){
      this.battleField.remove(new Point(x, y));
    }
  }

  async updateEntities(): Promise<void> { 

    this.players.forEach( (p: Player) => {
      this.movePlayers(p);
    });
  }
}
