import 'phaser';
import Room from './core/room';
import {centralize, clientDate, findBlock, isMovement} from './utils/engines';

export enum Direction {
  Up = 38,
  Down = 40,
  Right = 39,
  Left = 37,
}

//export type Stampable  = {timestamp: string;} & Entity;

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

export interface Stampable extends Entity{
  timestamp: string;
}

export interface Movement extends Stampable{
  moving: boolean;
  direction: Direction;
}

export interface PlayerCommand {
  playerId: string;
  command: Stampable | Movement;
}

export interface EnterRoomInfo {
  roomId?: string;
  playerId?: string;
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
  repeatedMovement = 0;
  moves: (Stampable | Movement)[] = [];

  constructor(scene: Room, {playerId, stats:{x, y}, skin}: ServerPlayer, local = true) {
    super(scene, x, y, skin);
    this.scene = scene;
    this.playerId = playerId;
    this.skin = skin!;

    this.scene.anims.create({
      key: `${this.skin}-walk-side`,
      frames: this.scene.anims.generateFrameNumbers(this.skin, {start: 0, end: 3}),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: `${this.skin}-walk-up`,
      frames: this.scene.anims.generateFrameNumbers(this.skin, {start: 4, end: 7}),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: `${this.skin}-walk-down`,
      frames: this.scene.anims.generateFrameNumbers(this.skin, {start: 8, end: 11}),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: `${this.skin}-dead`,
      frames: this.scene.anims.generateFrameNumbers(this.skin, {start: 12, end: 17}),
      frameRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: `${this.skin}-stand`,
      frames:[{key: this.skin, frame: 9}],
      frameRate: 10,
      repeat: -1
    });
  }

  die(): void {
    if(this.alive) {
      this.alive = false;
      this.moving = false;
      this.setVelocity(0, 0);
      this.anims.play(`${this.skin}-stand`, true);
      this.anims.play(`${this.skin}-dead`, true);
      this.scene.sendMovement(this.buildCommand());
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
        this.setMovement(true, cursors.right.keyCode);
      } else if (cursors.up.isDown) {
        this.setMovement(true, cursors.up.keyCode);
      } else if (cursors.down.isDown) {
        this.setMovement(true, cursors.down.keyCode);
      } else {
        this.setMovement(false);
      }
      if(Phaser.Input.Keyboard.JustDown(cursors.space)){
        this.scene.setBomb(this);
        this.scene.sendMovement(this.buildCommand(true));
      }
    }
  }

  setMovement(moving: boolean, keyCode = 40, local=true): void {
    if (moving != this.moving || keyCode != this.direction && this.alive) {
      this.direction = keyCode;
      this.moving = moving;
      if (local) {
        this.scene.sendMovement(this.buildCommand());
        console.warn(this.x, this.y)
      }
    } 
    if(this.moving && keyCode === this.direction && this.alive) {
      if (local) {
        this.repeatedMovement ++;
        if (this.repeatedMovement === 3) {
          this.repeatedMovement = 0;
          this.scene.sendMovement(this.buildCommand());
        }
      }
    }
  }

  move(): void {
    if (this.moving && this.alive) {
      switch (this.direction) {
        case Direction.Up:
          this.anims.play(`${this.skin}-walk-up`, true);
          this.setVelocityY(-180);
          break;
        case Direction.Down:
          this.anims.play(`${this.skin}-walk-down`, true);
          this.setVelocityY(180);
          break;
        case Direction.Right:
          this.resetFlip();
          this.anims.play(`${this.skin}-walk-side`, true);
          this.setVelocityX(180);
          break;
        case Direction.Left:
          this.setFlipX(true);
          this.anims.play(`${this.skin}-walk-side`, true);
          this.setVelocityX(-180);
          break;
      }
    } else if (!this.moving && this.alive) {
      this.setVelocity(0, 0);
      this.anims.play(`${this.skin}-stand`, true);
    }
  }

  async moveSwitch(latency: number): Promise<void> {
    this.timestamp = clientDate.toISOString();
    setTimeout(() => {
      const movement = this.moves.shift();
      this.x = movement!.x;
      this.y = movement!.y;
      if (isMovement(movement!)) {
        this.setMovement(movement!.moving, movement!.direction, false);
      } else {
        console.warn('entrou na bomba')
        this.scene.setBomb(this);
      }
    }, latency);
  }

  private buildCommand(bomb = false): ObjectDto<PlayerCommand> {
    let pc: PlayerCommand;
    if (bomb) {
      const {x, y} = centralize(this);
      pc = {
        playerId: this.playerId,
        command: {
          timestamp: clientDate.toISOString(),
          x: x,
          y: y 
        }
      }

    } else {
      pc = {
        playerId: this.playerId,
        command: {
          timestamp: clientDate.toISOString(),
          moving: this.moving,
          direction: this.direction,
          x: this.x,
          y: this.y
        }
      }
    }

    const dto: ObjectDto<PlayerCommand> = {
      info: this.scene.infos.roomId!,
      data: pc
    }
    return dto;
  }
}