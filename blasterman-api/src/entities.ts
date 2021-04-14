import EventEmitter from 'events';
import RoomManager from './room';

export enum Direction {
  Up = 1,
  Down,
  Right,
  Left,
}

export type Pos = [x: number, y: number];

export interface Movement {
  timestamp: string;
  moving: boolean;
  direction: Direction;
}

export interface Status {
  pos: Pos;
  alive: boolean;
}

export interface PlayerCommand {
  playerId: string;
  movement: Movement;
}

export interface Player extends EventEmitter{
  playerId: string;
  stats?: Status;
  moves?: Movement[];
  moveSwitch?: (time: number) => Promise<void>; 
}

export class Dinamite {
  constructor() {
    setTimeout( this.explode, 3);
  }

  explode(): void {
    
  }
}
