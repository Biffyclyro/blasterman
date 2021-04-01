import {Physics} from 'universe';

export default class RoomManager {
  private players: Map<string, Player>;
  private readonly TICK_RATE: number = 0.1;
  private events: Event;

  constructor() {
    this.players = new Map();
    this.tickTimer: number = 0.0;
    this.physics = new Physics(this.players); 
  }

  public pushPlayers(p: Player): void {
    if (!players.has(p.playerId) {
      p.moveSwitch = (time: number) => {
        setTimeout( p.moves.pop(), time);
      }
      p.addEventListner('move_switch', p.moveSwitch()); 
      this.players.set(p.playerId, p); 
      
    }
  }

  public tickeClientState(timeElapsed) {
    this.tickTimer += timeElapsed;

    if ( this.tickTimer < this.TICK_RATE) return;

    this.tickTimer = 0.0;

  }

  public updatePos({playerId: string, move: Move}): void {
    switch(move.direction) {
      case 1:
        

    }

  }

  public addMove(playerId: string, move: Move) {
    if (this.players.has(playerId)) {
      const p = this.players.get(playerId);
      p.moves.push(move);
      this.dispatchEvent(this.physics.moveSwitch);
      
    }
  }

  public updateEntities(): Map<string, Move> {
    const playersMoves: Map<string, Move>;

    this.players.forEach( p => {
      const move = p.moves.pop();
      playersMoves.set(p.playerId, move);
    });

    return playersMoves;
        
  }
  public movePlayer(p: Player): void {
    
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

export interface Player {
  playerId: string;
  stats: Status;
  moves: Move[];
  moveSitch(time: number): void;
}
