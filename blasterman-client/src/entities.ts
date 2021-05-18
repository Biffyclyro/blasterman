import Sprite = Phaser.Physics.Arcade.Sprite;

export class Player extends Sprite {
  playerId: string;
  moving: boolean;
  direction: Direction;
  scene: Room;

  constructor(scene: Room, 
              x: number, 
              y: number) {
    super(scene, x, y, key);
    
    this.scene.anims.create({
      key: 'side-walk';
      frames:[{key: this.skin,
               frame: },
              {},
              {}], 
      framRate: 10,
      repeat: 0
    });
  }
  




}

export enum Direction {
  Up = 1,
  Down,
  Right,
  Left,
}

