import RoomManager from '../src/room'
import {Player, Movement, World, PlayerCommand} from '../src/entities';
import EventEmitter from 'events';

describe('RoomTester', () => {
  let room: RoomManager;
  let time: Date;
  let newTime: Date;
  let player: Player;
  let com: Movement;
  let movement: PlayerCommand;
  
  beforeAll(() => {
    time = new Date();
    player = {
      playerId: 'test',
      stats: {
        alive: true,
        timestamp: time.toISOString(), 
        x: 0,
        y: 0
      }
    }

    newTime = new Date();
    newTime.setMilliseconds(time.getMilliseconds() + 10);
    com = {
      timestamp: time.toISOString(),
      moving: true,
      direction: 4
    }

    movement = {
      playerId: 'test', 
      command: com 
    }

    room = new RoomManager();
    room.addPlayer(player);
  });

  it('should create room', () => {
    expect(room).toBeTruthy();
  });

  it('should create player', () =>{
    expect(room.getPlayer('test')).toBeTruthy();
  });

  it('should add movement', () => {
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
    room.setBomb({
      timestamp: time.toISOString(),
      x: 0,
      y: 0
    }, player);
    //@ts-ignore
    const resp = room.world.checkCollision({x:0, y:0});

    expect(!resp).toBeTruthy();
  });

  it('should calculate latency', () => {
    room.addMove(movement);
    //@ts-ignore
    const latency = room.latencyCalculator(newTime.toISOString(), player);
    expect(latency === 10).toBeTruthy();
  });
  
  it('should move player', async() =>{
    room.addMove(movement);
    //@ts-ignore
    room.movePlayer(player);
    const movedPlayer = room.getPlayer('test');

    expect(movedPlayer!.stats.x !== player.stats.x);
  });
});
