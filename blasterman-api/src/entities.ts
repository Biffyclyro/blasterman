import EventEmitter from 'events';
import RoomManager from './room';
import Quadtree from 'quadtree-lib';

export enum Direction {
  Up = 38,
  Down = 40,
  Right = 39,
  Left = 37,
}

export type Stampable  = {timestamp: string;} & Entity;

export type Status = {alive: boolean;} & Stampable;

export type Block = {breakable?: boolean;} & Entity;

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
  position: Entity;
}

export interface Player {
  playerId: string;
  skin?: string;
  stats?: Status;
  moves?: Movement[];
  moveSwitch?: (time: number) => Promise<void>; 
}

export interface BattlefieldMap {
  tiles: string;
  breakableBlocks: Entity[];
  background: {key: string, url: string};
}

export interface EnterRoomInfo {
  players: Player[]; 
  map: BattlefieldMap;
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
  readonly battleField: Quadtree<Entity> = new Quadtree({width:1366, height:768});
  private readonly BLOCK_SIZE = 32;

  constructor(bm: BattlefieldMap) {
    super();
    this.buildMap(bm);
  }

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
            this.explode(d);
          }
        });

        this.battleField.push(dinamite);
      }, latency);
    }
  }

  explode(d: Dinamite): void{
    this.battleField.remove(d);
    d.emit('explosion');
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

  private buildMap(bm: BattlefieldMap): void {
    const offsetSide = 153;
    const offsetUp = 11;

    for (let i = 0; i < 33; i++) {

      this.createBlock({ x: i * this.BLOCK_SIZE + offsetSide, y: offsetUp, breakable: false });
      this.createBlock({ x: i * this.BLOCK_SIZE + offsetSide, y: this.BLOCK_SIZE * 18 + offsetUp, breakable: false });

      if (i < 19) {
        //linha vertical quesquerda
        this.createBlock({x: offsetSide, y: i * this.BLOCK_SIZE + offsetUp, breakable: false});
        //linha vertical direita
        this.createBlock({x: this.BLOCK_SIZE * 32 + offsetSide, y: i * this.BLOCK_SIZE + offsetUp, breakable: false});
      }

      if (i % 2 === 0) {
        for (let j = 2; j <= 16; j += 2) {
          this.createBlock({ x: i * this.BLOCK_SIZE + offsetSide, y: j * this.BLOCK_SIZE + offsetUp, breakable: false });
        }
      } 
    }

    bm.breakableBlocks.forEach((b: Block) => {
      this.createBlock({
        x: b.x * this.BLOCK_SIZE + offsetSide,
        y: b.y * this.BLOCK_SIZE + offsetUp,
        breakable: true
      });
    });
  }

  isBlock(block: Block | Entity): block is Block {
    return (block as Block).breakable !== undefined;
  }
  
  touchExplosion(entity: Entity): boolean {
    const possibleExplosion = this.battleField.colliding(entity).pop();
    if(possibleExplosion && (possibleExplosion as Explosion).elementType === 'explosion') {
      return true
    } else { return false}
  }

  getCampo(): Entity[]{
    const cords:Entity[] = [];

    this.battleField.each(b => {
      cords.push({x: b.x, y:b.y});
    });

    return cords;
  }
}

export const isMovement = (movement: Movement 
                          | Stampable): movement is Movement => {
  return (movement as Movement).direction !== undefined;
}
