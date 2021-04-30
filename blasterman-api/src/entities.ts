import EventEmitter from 'events';
import RoomManager from './room';
import Quadtree from 'quadtree-lib';


export enum Direction {
  Up = 1,
  Down,
  Right,
  Left,
}

export type Stampable  = {timestamp: string;} & Entity;

export type Status = {alive: boolean;} & Entity;

export type Block = {breakable: boolean;} & Entity;

export interface Entity {
  x:number;
  y:number;
  width?: number;
  height?:number;
}

export interface Movement {
  timestamp: string;
  moving: boolean;
  direction: Direction;
}

export interface PlayerCommand {
  playerId: string;
  command: Movement | Stampable;
}

export interface Player extends EventEmitter{
  playerId: string;
  stats?: Status;
  moves?: Movement[];
  moveSwitch?: (time: number) => Promise<void>; 
}

export class Dinamite  extends EventEmitter implements Entity{
  readonly width = 24;
  readonly height = 24;
  readonly x: number;
  readonly y: number;
  
  constructor(x: number,y: number) {
    super();
    this.x = x;
    this.y = y;
    setTimeout( this.explode, 3000);
  }

  explode(): void {
   this.emit('explode', this); 
  }
}

export class World {
  private readonly battleField: Quadtree<Entity> = new Quadtree({width:1024, height:544});
  private readonly BLOCK_SIZE = 32;

  createBlock(block: Block): void {
    block.width = this.BLOCK_SIZE;
    block.height = this.BLOCK_SIZE;
    this.battleField.push(block);
  }

  checkCollision(entity: Entity): boolean {
    return this.battleField.colliding(entity) ? true : false;
  }

  destroyBlock({x, y}:{x:number, y:number}):void {
    const block = this.battleField.find((block) => {
      return block.x === x && block.y === y && this.isBlock(block);
    }).pop();

    if(block && (block as Block).breakable) { this.battleField.remove(block) }
  }

  setDinamite(x: number, y:number, latency: number): void {
    if (!this.battleField.colliding({x:x, y:y})) {
      setTimeout(() => {
        let dinamite: Dinamite | null = new Dinamite(x, y);
        dinamite.on('explode', (d: Dinamite) => {
          if (d === dinamite ){ 
            dinamite = null
          }
        });

        this.battleField.push(dinamite);
      }, latency);
    }
  }

  isBlock(block: Block | Entity): block is Block {
    return (block as Block).breakable !== undefined;
  }
}

export const isMovement = (movement: Movement | Stampable): movement is Movement => {
  return (movement as Movement).direction !== undefined;
}
