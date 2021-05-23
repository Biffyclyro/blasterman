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
  skin: string;
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

export interface SpriteWithId extends Phaser.Physics.Arcade.Sprite {
  id?: string;
}

export interface Explosion {
  explosionBody: Phaser.GameObjects.Sprite[];
  explosionEnd: Phaser.GameObjects.Sprite[];
}

export interface NearBlocks {
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
  timestamp: string;

  constructor(scene: Room, {skin, playerId, stats:{x, y}}: ServerPlayer) {
    super(scene, x, y, skin);
    this.scene = scene;
    this.playerId = playerId;
    this.skin = skin!;

    this.scene.anims.create({
      key: 'walk-side',
      frames: this.scene.anims.generateFrameNumbers(this.skin, {start: 0, end: 3}),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'walk-up',
      frames: this.scene.anims.generateFrameNumbers(this.skin, {start: 4, end: 7}),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'walk-down',
      frames: this.scene.anims.generateFrameNumbers(this.skin, {start: 8, end: 11}),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'dead',
      frames: this.scene.anims.generateFrameNumbers(this.skin, {start: 12, end: 17}),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'stand',
      frames:[{key: this.skin, frame: 9}],
      frameRate: 10,
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
    if (this.alive) {
      if (cursors.left.isDown) {
        this.setMovement(true, cursors.left.keyCode);
      } else if (cursors.right.isDown) {
        this.setMovement(true, cursors.left.keyCode);
      } else if (cursors.up.isDown) {
        this.setMovement(true, cursors.left.keyCode);
      } else if (cursors.down.isDown) {
        this.setMovement(true, cursors.left.keyCode);
      } else {
        this.setMovement(false);
      }
    }
  }

  setMovement(moving: boolean, keyCode = 40): void {
    this.direction = keyCode; 
    this.moving = moving;
  }

  move(): void {
    if(this.moving && this.alive){
      switch(this.direction) {
        case Direction.Up:
          this.anims.play('walk-up', true);
          this.setVelocityY(-180);
          break
        case Direction.Down:
          this.anims.play('walk-down', true);
          this.setVelocityY(180);
          break
        case Direction.Right:
          this.resetFlip();
          this.anims.play('walk-side', true);
          this.setVelocityX(180);
          break
        case Direction.Left:
          this.setFlipX(true);
          this.anims.play('walk-side', true);
          this.setVelocityX(-180);
          break
      }
    } else {
      this.setVelocity(0, 0);
      this.anims.play('stand', true);
    }
  }
}
