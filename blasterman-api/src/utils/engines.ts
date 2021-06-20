import {v4 as uuid} from 'uuid';
import { Direction, Entity } from '../entities';

export const idGenerator = (): string => {
  return uuid(); 
}

export const verifyPositionTolerance = (a: number, b: number): boolean => {
  return Math.abs(a - b) <= 48;
}

export const differenceFinder = (a: number, b: number ): number => {
  return Math.abs(a - b) 
}

export const correctEntityPosition = (a: Entity, b: Entity): void => {
  if (verifyPositionTolerance(a.x, b.x)) {
    b.x = a.x;
  }
  if (verifyPositionTolerance(a.y, b.y)) {
    b.y = a.y;
  }
}
/*
export const inversor = (entity:Entity, input: boolean = true): Entity => {
  if (input) {
    entity.x -= 8 
    entity.y -= 10
  } else {
    entity.x += 8
    entity.y += 10 
  }
  return entity;
} */

export const movementPredictor = ({x, y}: Entity, d: Direction, v: number): Entity => {
  let h = 0;
  let w = 0;
  switch (d) {
    case Direction.Down:
      y += v;
      w = 16;
      break;
    case Direction.Up:
      y -= v;
      w = 16;
      break;
    case Direction.Left:
      x -= v;
      h = 22;
      break;
    case Direction.Right:
      x += v;
      h = 22;
      break;
  }

  return {
    x: Math.round(x), 
    y: Math.round(y), 
    width: 16, 
    height: 22
  };
}

export const battleFieldMap = {
  tiles: 'area01/tiles-area01.png',
  breakableBlocks: [
            {x:4, y:1},{x:5, y: 1}, {x:14, y:1},{x:21, y:1},{x:22, y:1},
            {x:5, y:2}, {x:7, y:2},{x:21, y:2},{x:23, y:2},
            {x:3, y:3},{x:14, y:3},{x:16, y:3}, {x:22, y:3},
            {x:3, y:4},{x:7, y:4},{x:9, y:4}, {x:17, y:4},{x:19, y:4},{x:21, y:4},
            {x:9, y:5},{x:10, y:5}, {x:11, y:5},{x:22, y:5},{x:24, y:5},
            {x:3, y:6},{x:9, y:6}, {x:11, y:6},{x:17, y:6},{x:23, y:6},
            {x:2, y:7},{x:3, y:7}, {x:4, y:7},{x:6, y:7},{x:15, y:7}, {x:16, y:7},{x:17, y:7},
            {x:7, y:8},{x:11, y:8}, {x:13, y:8},
            {x:6, y:9},{x:7, y:9}, {x:8, y:9},{x:13, y:9},{x:17, y:9},
            {x:11, y:10},{x:13, y:10}, {x:15, y:10},{x:17, y:10},
            {x:7, y:11},{x:16, y:11}, {x:17, y:11},{x:18, y:11},{x:24, y:11},
            {x:17, y:12},
            {x:11, y:13},{x:15, y:13}, {x:19, y:13},{x:24, y:13},
            {x:9, y:14},{x:19, y:14}, {x:21, y:14},{x:23, y:14},
            {x:5, y:15},{x:9, y:15}, {x:15, y:15},{x:23, y:15},{x:24, y: 15},
            {x:3, y:16},{x:7, y:16}, {x:17, y:16},
            {x:3, y:17},{x:10, y:17},{x:21, y:17}
        ],
  background: {
    key: 'bg-area01',
    url: 'area01/bg-area01.jpg'
  }
}