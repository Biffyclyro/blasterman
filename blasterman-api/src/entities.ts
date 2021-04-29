import EventEmitter from 'events';
import RoomManager from './room';
import Quadtree from 'quadtree-lib';


export enum Direction {
  Up = 1,
  Down,
  Right,
  Left,
}

export interface Entity {
  x:number;
  y:number;
  width?: number;
  height?:number;
}

export interface Block extends Entity{
  breakable: boolean;
}

export interface Movement {
  timestamp: string;
  moving: boolean;
  direction: Direction;
}

export interface Stampable extends Entity{
  timestamp: string;
}

export interface Status extends Entity{
  alive: boolean;
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
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
  
  constructor(x: number, 
              y: number,
              private timestamp: string) {
    super();
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 24;
    setTimeout( this.explode, 3000);
  }

  explode(): void {
   this.emit('explode', this); 
  }
}

export class World {
  private readonly battleField: Quadtree<Entity>;  
  private readonly BLOCK_SIZE = 32;

  constructor() {
    this.battleField = new Quadtree({width:1024, height:544});
  }

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

  setDinamite(x: number, y:number, timestamp: string): void {
    if (!this.battleField.colliding({x:x, y:y})) {
      let dinamite: Dinamite | null;
      setTimeout(() => {
        dinamite = new Dinamite(x, y, timestamp);
        dinamite.on('explode', (d: Dinamite) => {
          if (d === dinamite ){ 
            dinamite = null
          }
        });

        this.battleField.push(dinamite);
      }, 40);

    }
  }

  isBlock(block: Block | Entity): block is Block {
    return (block as Block).breakable !== undefined;
  }

}

export const isMovement = (movement: Movement | Stampable): movement is Movement => {
  return (movement as Movement).direction !== undefined;
}


