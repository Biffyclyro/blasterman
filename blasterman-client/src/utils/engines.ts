import {Entity, NearBlocks} from '../entities'

export const centralize(e: Entity): Entity {
  let difX = e.x % 32;

  let x;

  difX >= 18 ? x = e.x + (32 - difX) : x = e.x - difX;

  let difY = e.y % 32;

  let y;

  difY >= 18 ? y = e.y + (32 - difY) : y = e.y - difY;

  y += 16;

  return {x, y}
}

export const findBlock = (bloc, {x: x, y: y}: Sprite, v: NearBlocks, mult: number) => {
  let blkSize = 32 * mult;
  if (bloc.x == (x + blkSize) && bloc.y == y) {
    if (!v.r || bloc.x < v.r.x) {
      if (bloc.id == 'b') bloc.id = 'f';
      if (v.r && v.r.id == 'f') {
        console.log('essa bosta n faze sentido')
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
