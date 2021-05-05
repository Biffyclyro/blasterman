import RoomManager from '../src/room'
import {Player, Movement, World} from '../src/entities';
import EventEmitter from 'events';

describe('RoomTester', () => {
  let room: RoomManager;
  const player: Player = {
    playerId: 'test',
    stats: {
      alive: true,
      timestamp: '2021-05-04T19:04:33.062Z',
      x: 0,
      y: 0
    }
  }

  beforeAll(() => {
    room = new RoomManager();
  });

  it('should create', () => {
    expect(room).toBeTruthy();
  });

  it('should create player', () =>{
    room.addPlayer(player);
    expect(room.getPlayer('test')).toBeTruthy();
  });

  it('should add movement', () => {
    room.addPlayer(player); 
    const com = {
      timestamp: '2021-05-04T19:04:33.062Z',
      moving: true,
      direction: 1
    }

    const movement = {
      playerId: 'test', 
      command: com 
    }
    room.addMove(movement);

    const p = room.getPlayer('test');

    const resp = (): boolean => {
      if ( p ) {
        if ( p.moves){
          return p.moves[1] === com;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    
    expect(resp()).toBeTruthy();
  });

  it('should set bomb', async () => {
    room.addPlayer(player); 
    room.setBomb({
      timestamp: '2021-05-04T19:04:33.062Z',
      x: 0,
      y: 0
    }, player);

    //@ts-ignore
    const resp = room.world.checkCollision({x:0, y:0});

    expect(resp).toBeTruthy();
  });

  it('should calculate latency', () => {
    //@ts-ignore
    const latency = room.latencyCalculator('2021-05-04T19:04:33.072Z', player);

    expect(latency === 10).toBeTruthy();
  });

});
