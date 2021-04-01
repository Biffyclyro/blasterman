import {Physics, Action} from './universe';
import EventEmitter from 'events';


export default class RoomManager {
  private players: Map<string, Player>;
  private readonly TICK_RATE: number = 0.1;
  private physics: Physics;

  constructor() {
    this.players = new Map();
    this.physics = new Physics(); 
  }

  pushPlayers(p: Player): void {
    if (!this.players.has(p.playerId) ) {
      p.moveSwitch = async (time: number) => {
        setTimeout( p.moves.pop, time);
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



  updateEntities(): Map<string, Move> {
    const playersMoves = new Map<string, Move>();

    this.players.forEach( p => {
      const move = p.moves.pop();
      playersMoves.set(p.playerId, move);
    });

    return playersMoves;
        
  }
  movePlayers(p: Player): void{
    
  }

  

}

export enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
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
  moveSwitch?: Action; 
}
