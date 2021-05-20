import 'phaser';
import Room from './core/room';
import {centralize, findBlock} from './utils/engines';

export enum Direction {
  Up = 38,
  Down = 40,
  Right = 39,
  Left = 37,
}

export type Stampable  = {timestamp: string;} & Entity;

export type Status = {alive: boolean;} & Stampable;

export interface ObjectDto<T> {
  info?: string;
  data?: T;
}

export interface ServerPlayer {
  playerId: string;
  skin?: string;
  stats: Status;
}

export interface EnterRoomInfo {
  player?: ServerPlayer;
  players: ServerPlayer[]; 
  map: BattlefieldMap;
}

export interface Entity {
  x: number;
  y: number;
}

interface SpriteWithId extends Phaser.Physics.Arcade.Sprite {
    id?: string;
}

interface NearBlocks {
    r?: SpriteWithId;
    l?: SpriteWithId;
    u?: SpriteWithId;
    d?: SpriteWithId;
}

export interface BattlefieldMap {
  numPlayers: number;
  tiles: string;
  breakableBlocks: Entity[];
  background: {key: string, url: string};
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  skin: string;
  playerId: string;
  moving = false;
  direction = Direction.Down;
  scene: Room;
  alive = true;
  tamBomb = 2;

  constructor(scene: Room, {skin, playerId, stats:{x, y}}: ServerPlayer) {
    super(scene!, stats.x, stats.y, skin);
    this.playerId = playerId;
    this.skin = skin!;

    this.scene.anims.create({
      key: 'walk-side',
      frame: this.scene.anims.generateFrameNumbers(this.skin, {start: 0, end: 3}),
      framRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'walk-up',
      frame: this.scene.anims.generateFrameNumbers(this.skin, {start: 4, end: 7}),
      framRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'walk-down',
      frame: this.scene.anims.generateFrameNumbers(this.skin, {start: 8, end: 11}),
      framRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'dead',
      frame: this.scene.anims.generateFrameNumbers(this.skin, {start: 12, end: 17}),
      framRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'stand',
      frame:[{key: this.skin, frame: 9}],
      framRate: 10,
      repeat: -1
    });
  }

  die(): void {
    if(this.alive) {
      if(this.moving){
        this.moving = false;
      }

      this.anims.play('dead', true);
      this.once('animationcomplete', () => {
        this.destroy();
      });
    }
  }

  localCommands (cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (p.alive) {
      if (cursors.left.isDown) {
        this.setMovement(cursors.left.keyCode, true);
      } else if (cursors.right.isDown) {
        this.setMovement(cursors.left.keyCode, true);
        this.direction = Direction.right;
        this.moving = true;
      } else if (cursors.up.isDown) {
        this.setMovement(cursors.left.keyCode, true);
        this.direction = Direction.up;
        this.moving = true;
      } else if (cursors.down.isDown) {
        this.setMovement(cursors.left.keyCode, true);
        this.direction = Direction.down;
        this.moving = true;
      } else {
        this.setMovement(false);
        this.direction = Direction.down;
        this.moving = false;
      }
    }
  }

  setMovement(keyCode = 40, moving: boolean): void {
    this.direction = keyCode; 
    this.moving = moving;
  }

  move(): void {
    if(this.moving && this.alive){
      switch(Direction) {
        case 1:
          this.anims.play('walk-up', true);
          this.setVelocityY(-180);
          break
        case 2:
          this.anims.play('walk-down', true);
          this.setVelocityY(180);
          break
        case 3:
          this.resetFlip();
          this.anims.play('walk-side', true);
          this.setVelocityX(180);
          break
        case 4:
          this.setFlipX(true);
          this.anims.play('walk-down', true);
          this.setVelocityX(-180);
          break
      }
    } else {
      this.setVelocity(0, 0);
      this.anims.play('stand', true);
    }
  }
}
