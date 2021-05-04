import RoomManager from '../src/room'


describe('EnterRoomTester', () => {
  let room: RoomManager;

  beforeEach(() => {
    room = new RoomManager();
  });

  it('should create', () => {
    expect(room).toBeTruthy();
  });
});
