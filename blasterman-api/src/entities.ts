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

export type Status = {alive: boolean;} & Stampable;

export type Block = {breakable: boolean;} & Entity;

type Explosion = {elementType: string;} & Entity;

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

export interface Player {
  playerId: string;
  stats: Status;
  emitter?: EventEmitter;
  moves?: Movement[];
  moveSwitch?: (time: number) => Promise<void>; 
}

export class Dinamite  extends EventEmitter implements Entity{
  readonly width = 24;
  readonly height = 24;
  readonly x: number;
  readonly y: number;
  size: number;
  
  constructor(x: number,y: number, size: number = 2) {
    super();
    this.x = x;
    this.y = y;
    this.size = size;
    setTimeout( this.explode.bind(this), 3000);
  }

  explode(): void {
   this.emit('explode', this); 
  }
}

export class World extends EventEmitter {
  private readonly battleField: Quadtree<Entity> = new Quadtree({width:1024, height:544});
  private readonly BLOCK_SIZE = 32;

  createBlock(block: Block): void {
    block.width = this.BLOCK_SIZE;
    block.height = this.BLOCK_SIZE;
    this.battleField.push(block);
  }

  checkCollision(entity: Entity): boolean {
    return this.battleField.colliding(entity).pop() ? true : false;
  }

  destroyBlock({x, y}:Entity): void {
    const block = this.battleField.find((block) => {
      return block.x === x && block.y === y && this.isBlock(block);
    }).pop();

    if(block && (block as Block).breakable) { this.battleField.remove(block) }
  }

  setDinamite(x: number, y:number, latency: number): void {
    if (!this.checkCollision({x:x, y:y})) {
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

  explode(d: Dinamite): void{
    let sectionSize = 0;
    const explosionSection = {
      up: true,
      right: true,
      down: true,
      left: true,
    }
    this.createExplosion(d);
    for(let i = 0; i < d.size; i++) {
      sectionSize += 32;
      if(explosionSection.up) {
        explosionSection.up = this.createExplosion({x: d.x, y: d.y + sectionSize});
      }
      if(explosionSection.right) {
        explosionSection.right = this.createExplosion({x: d.x + sectionSize, y: d.y});
      }
      if(explosionSection.down) {
        explosionSection.down = this.createExplosion({x: d.x, y: d.y - sectionSize});
      }
      if(explosionSection.left) {
        explosionSection.left = this.createExplosion({x: d.x - sectionSize, y: d.y});
      }
    }
  }

  createExplosion(e: Entity): boolean{
    const explosion = {
      x: e.x,
      y: e.y,
      width: 32,
      height: 32,
      elementType: 'explosion'
    }
    if(!this.checkCollision(explosion)) {
      this.battleField.push(explosion);
      setTimeout(this.battleField.remove.bind(this), 1000, explosion);
      return true;
    } else {
      const element = this.battleField.colliding(explosion).pop();
      if( element && this.isBlock(element)) {
        if(element.breakable) {
          this.battleField.remove(element);    
        } 
      }
      return false;
    }
  }

  isBlock(block: Block | Entity): block is Block {
    return (block as Block).breakable !== undefined;
  }
  
  touchExplosion(entity: Entity): boolean {
    const possibleExplosion = this.battleField.colliding(entity).pop();
    if(possibleExplosion && (possibleExplosion as Explosion).elementType === 'explosion') {
      return true
    }else { return false}
  }
}

export const isMovement = (movement: Movement 
                          | Stampable): movement is Movement => {
  return (movement as Movement).direction !== undefined;
}
