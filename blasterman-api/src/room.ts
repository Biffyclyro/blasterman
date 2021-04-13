import {Physics, Action} from './universe';
import EventEmitter from 'events';
import {QuadTree, Box, Point, Circle} from 'js-quadtree';


export default class RoomManager {
  private readonly players: Map<string, Player>;
  private readonly physics: Physics;
  private readonly battleField: QuadTree;
  private readonly VELOCITY: number;
    

  constructor() {
    this.players = new Map();
    this.physics = new Physics(this.updateEntities); 
    this.battleField = new QuadTree(new Box(0, 0, 31, 17));
    this.VELOCITY = 5;
  }

  addPlayers(p: Player): void {
    if (!this.players.has(p.playerId) ) {
      p.moveSwitch = async (time: number) => {
        setTimeout( p.moves.pop, time);
        return p;
      }
      p.on('move_switch', p.moveSwitch); 
      this.players.set(p.playerId, p); 
      
    }
  }

 
  addMove(playerId: string, move: Move): void {
    const p = this.players.get(playerId);
    if (p) {
      p.moves.push(move);
      p.emit('move_switch');
      
    }
  }

  findEntity(x:number, y:number): boolean {
    return this.battleField.query(new Box(x, y, 1, 1)) === undefined;
  }

  


  async updateEntities(): Promise<void> { 

    this.players.forEach( (p: Player) => {
      const move = p.moves[0];
      const pos = p.stats.pos;
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

    });
  }

}



export enum Direction {
  Up = 1,
  Down,
  Right,
  Left,
}

export type Pos = [x: number, y: number];

export interface Move {
  timestamp: string;
  moving: boolean;
  direction: Direction;
}

export interface Status {
  pos: Pos;
  alive: boolean;
}

export interface Player extends EventEmitter{
  playerId: string;
  stats: Status;
  moves: Move[];
  moveSwitch?: (time: number) => Promise<Player>; 
}
