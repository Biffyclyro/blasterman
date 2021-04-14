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
  command: Movement | {pos: Pos, timestamp: string};
}

export interface Player extends EventEmitter{
  playerId: string;
  stats?: Status;
  moves?: Movement[];
  moveSwitch?: (time: number) => Promise<void>; 
}

export class Dinamite extends EventEmitter{
  constructor(private pos: Pos, private timestamp: string) {
    super();
    setTimeout( this.explode, 3000);
  }

  explode(): void {
   this.emit('explode', this); 
  }
}

export const isMovement = (movement: Movement | {pos: Pos, timestamp: string}): movement is Movement => {
  return (movement as Movement).direction !== undefined;
}


