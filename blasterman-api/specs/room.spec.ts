import RoomManager from '../src/room'
import {Player} from '../src/entities';
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
    room.addMove({
      playerId: 'test', command: {
        timestamp: '2021-05-04T19:04:33.062Z',
        moving: true,
        direction: 1
      }
    });
  });

  it('should set bomb', () => {
    room.addPlayer(player); 
    room.setBomb({
      timestamp: '2021-05-04T19:04:33.062Z',
      x: 0,
      y: 0
    }, player);
  });

});
