import 'phaser';
import {Entity, Movement, NearBlocks, SpriteWithId, Stampable} from '../entities'

export const API_URL = 'http://localhost:8090';

export const clientDate = new Date();

export const centralize = (e: Entity): Entity => {
  const difX = e.x % 32;

  let x;

  difX >= 18 ? x = e.x + (32 - difX) : x = e.x - difX;

  const difY = e.y % 32;

  let y;

  difY >= 22 ? y = e.y + (32 - difY) : y = e.y - difY;

  y += 16;

  return {x, y}
}

export const isMovement = (movement: Movement 
                          | Stampable): movement is Movement => {
  return (movement as Movement).direction !== undefined;
}

export const findBlock = (bloc: SpriteWithId, 
                          {x: x, y: y}: Phaser.GameObjects.Sprite, 
                          v: NearBlocks, mult: number): void => {
  const blkSize = 32 * mult;
  if (bloc.x == (x + blkSize) && bloc.y == y) {
    if (!v.r || bloc.x < v.r.x) {
      if (bloc.id == 'b') bloc.id = 'f';
      if (v.r && v.r.id == 'f') {
        v.r.id = 'b';
      }
      v.r = bloc;
    }

  } else if (bloc.x == x - blkSize && bloc.y == y) {

    if (!v.l || bloc.x > v.l.x) {
      if (bloc.id == 'b') bloc.id = 'f';
      if (v.l && v.l.id == 'f') {
        v.l.id = 'b';
      }
      v.l = bloc;
    }
  } else if (bloc.x == x && bloc.y == (y + blkSize)) {

    if (!v.d || bloc.y < v.d.y) {
      if (bloc.id == 'b') bloc.id = 'f';
      if (v.d && v.d.id == 'f') {
        v.d.id = 'b';
      }
      v.d = bloc;
    }
  } else if (bloc.x == x && bloc.y == (y - blkSize)) {

    if (!v.u || bloc.y > v.u.y) {
      if (bloc.id == 'b') bloc.id = 'f';
      if (v.u && v.u.id == 'f') {
        v.u.id = 'b';
      }
      v.u = bloc;
    }
  }
}

export const loading = (scene: Phaser.Scene): void => {
  const loading = scene.add.text(600, 450, 'Loading');

  loading.setScale(3, 3);

  const tween = scene.add.tween({
    targets: loading,
    y: 200,
    duration: 1000,
    ease: 'Power2',
    yoyo: true,
    delay: 100,
    repeat: -1
  });

  scene.events.on('end-loading', () => {
    tween.destroy();
    loading.destroy();
  });
}
