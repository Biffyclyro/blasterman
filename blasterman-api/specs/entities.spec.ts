import {World, Dinamite, Block} from '../src/entities';


describe('EntitiesTester', () => {
  let world: World;
  let dinamite: Dinamite;

  beforeAll(() => {
    world = new World();
  });

  it('should create world', () => {
    expect(world).toBeTruthy();
  });

  it('should create dinamite', () => {
    const dinamite = new Dinamite(0, 0);
    expect(dinamite).toBeTruthy();
  });

  it('should create block', () =>{
    const block: Block = {
      x: 16,
      y: 16,
      breakable: false
    }
    world.createBlock(block);
    const resp = world.checkCollision({x:16, y:16, width: 32, height:32});

    expect(resp).toBeTruthy();
  });

    it('should create dinamite', () => {
    world.setDinamite(52,52, 0);
    const resp = world.checkCollision({x:52, y:52});

    expect(!resp).toBeTruthy();
  });

  it('should destroy block', () => {
    const block: Block = {
      x: 48,
      y: 48,
      breakable: true
    }
    world.createBlock(block);
    world.destroyBlock({x:48, y:48});
    const resp = world.checkCollision({x:48, y:48});

    expect(!resp).toBeTruthy();
  });
});
