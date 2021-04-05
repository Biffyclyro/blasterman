import {Physics, Action} from './universe';
import EventEmitter from 'events';
import {QuadTree, Box, Point, Circle} from 'js-quadtree';


export default class RoomManager {
  private players: Map<string, Player>;
  private physics: Physics;
  private battleField: QuadTree;
  private readonly VELOCITY: number;
    

  constructor() {
    this.players = new Map();
    this.physics = new Physics(this.updateEntities); 
    this.campo = new QuadTree(new Box(0, 0, 31, 17));
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

  tickeClientState(timeElapsed: number) {
    /*this.tickTimer += timeElapsed;

    if ( this.tickTimer < this.TICK_RATE) return;

    this.tickTimer = 0.0;
    */

  }

  


  addMove(playerId: string, move: Move) {
    if (this.players.has(playerId)) {
      const p = this.players.get(playerId);
      p.moves.push(move);
      p.emit('move_switch');
      
    }
  }

  findEntity({x: number, y:number}): boolean {
    return this.battleField.query(new Box(x, y, 1, 1)) === undefined;
  }

  


  async updateEntities(): Promise<void> { 

    this.players.forEach( p => {
      const move = p.moves[0];
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
