import {Sprite} from 'phaser';
import {Room} from './core/room';

export enum Direction {
  Up = 1,
    Down,
    Right,
    Left,
}

export class Player extends Sprite{
  playerId: string;
  moving: boolean;
  direction: Direction;
  scene: Room;

  constructor(scene: Room, 
    x: number, 
    y: number) {
    super(scene, x, y, key);

    this.scene.anims.create({
      key: 'side-walk',
      frame: this.scene.anims.generateFrameNumbers({
        this.skin, {start: 0, end: 3}
      }),
      framRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'up-walk',
      frame: this.scene.anims.generateFrameNumbers({
        this.skin, {start: 4, end: 7}
      }),
      framRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'down-walk',
      frame: this.scene.anims.generateFrameNumbers({
        this.skin, {start: 8, end: 11}
      }),
      framRate: 10,
      repeat: 0
    });

    this.scene.anims.create({
      key: 'dead',
      frame: this.scene.anims.generateFrameNumbers({
        this.skin, {start: 12, end: 17}
      }),
      framRate: 10,
      repeat: 0
    });

  }





}


