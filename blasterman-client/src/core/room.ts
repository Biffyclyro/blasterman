import 'phaser'; 
import WebSocketService from '../services/websocket-service';
import {centralize, findBlock, API_URL, clientDate} from '../utils/engines';
import {
  NearBlocks, 
  Player, 
  EnterRoomInfo, 
  Explosion, 
  Entity, 
  BattlefieldMap, 
  SpriteWithId, 
  PlayerCommand, 
  ObjectDto,
  Movement,
  ServerPlayer
} from '../entities';
 

export default class Room extends Phaser.Scene {
  player: Player;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  infos: EnterRoomInfo;
  players = new Map<string, Player>();
  staticBlocks: Phaser.Physics.Arcade.StaticGroup; 
  readonly FRAME_SIZE = 32;
  readonly socket = WebSocketService.getInstance();
  private readonly localDate = clientDate;

  constructor() {
    super('Room');
  }

  init(infos: EnterRoomInfo): void {
    this.infos = infos;
    this.staticBlocks = this.physics.add.staticGroup();
  }

  preload(): void {
    this.load.audio('explosion-sound', './assets/sounds/explosion.mp3');
    this.load.spritesheet('tiles', 
      `${API_URL}/${this.infos.map.tiles}`, 
      {frameHeight: 32, frameWidth: 32});
    this.load.image(this.infos.map.background.key, 
      `${API_URL}/${this.infos.map.background.url}`); 
    this.load.spritesheet('dynamite', './assets/dinamite.png',{
      frameHeight: 32,
      frameWidth: 32
    });

    this.infos.players.forEach(p => {
      this.load.spritesheet(p.skin, 
        `${API_URL}/characters/${p.skin}.png`, {
          frameHeight: 32,
          frameWidth: 32});
    });
    
    this.game.events.on('focus', () => {
      this.socket.emit('get-game-state', {info: this.infos.roomId});
    });

    this.socket.on('message', (updateState: ObjectDto<ServerPlayer[]>) => {
      if (updateState.info === 'update-state') {
        console.log(updateState.data);
        console.log(this.players.values());
      }
    });
  }

  create(): void {
    this.sound.add('explosion-sound');
    this.anims.create({
      key: 'dynamite',
      frames: this.anims.generateFrameNumbers('dynamite', {start: 0, end: 10}),
      frameRate: 15,
      repeat: 0
    });
    this.anims.create({
      key: 'explosion',
      frames: this.anims.generateFrameNumbers('tiles', {start: 16, end: 23}),
      frameRate: 15,
      repeat: 0
    });
    this.anims.create({
      key: 'explosion-side',
      frames: this.anims.generateFrameNumbers('tiles', {start: 8, end: 15}),
      frameRate: 15,
      repeat: 0
    });
    this.anims.create({
      key: 'explosion-end',
      frames: this.anims.generateFrameNumbers('tiles', {start: 24, end: 31}),
      frameRate: 15,
      repeat: 0
    });
    this.anims.create({
      key: 'destroy',
      frames: this.anims.generateFrameNumbers('tiles', { start: 0, end: 6}),
      frameRate: 15,
      repeat: 0
    });

    this.buildMap(this.infos.map);
    this.infos.players.forEach(p => {
      const remotePlayer = this.addEntity(new Player(this, p))
        .setSize(9, 24)
        .setOffset(8, 10);
      this.players.set(p.playerId, remotePlayer);
    /*  if(p.playerId === this.infos.playerId) {
        this.player = this.addEntity( new Player(this, p))
                          .setSize(9, 24)
                          .setOffset(8,10);
      } else {
        const remotePlayer = this.addEntity(new Player(this, p))
                                 .setSize(9, 24)
                                 .setOffset(8, 10);
        this.players.set(p.playerId, remotePlayer);
      }
      */ 
    });
    this.socket.on('command', this.commandHandler.bind(this));
    this.events.on('focus', () => {
      console.log('pegou fogo')
    });
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(): void {
    this.players.forEach((v, k) => {
      if(v != undefined && v.alive) {
        if (v.playerId === this.infos.playerId){
          v.localCommands(this.cursors);
        }
        v.move();
      }
    });
/*
    if(this.player != undefined) {
      this.player.
      this.player.move();
    }
    */
  }
  
  commandHandler(dtoCommand: ObjectDto<PlayerCommand>): void {
    const id = dtoCommand.data!.playerId;
    if (id && id !== this.infos.playerId) {
      const p = this.players.get(id);
      const command = (dtoCommand.data!.command as Movement);
      if (p) {
        p.moves.push(command);
        const ms = this.latencyCalculator(command.timestamp, p);
        p.moveSwitch(ms);
      }
    }
  }

  sendMovement(pc: ObjectDto<PlayerCommand>): void {
    this.socket.emit('command', pc);
  }

  addEntity<T extends Phaser.GameObjects.GameObject>(e: T): T{
    this.add.existing(e);
    this.physics.add.existing(e);
    this.physics.add.collider(this.staticBlocks, e);
    return e;
  }

  createExplosion(e: Explosion, {x, y}: Phaser.GameObjects.Sprite, tamBomb: number): void {
    const corpo = tamBomb - 1;
    //corpo da explosão
    for (let i = 1; i <= corpo; i++) {
      e.explosionBody
        .push(this.physics.add.sprite(x + 32 * i, y, 'tiles', 15));

      e.explosionBody
        .push(this.physics.add.sprite(x, y - 32 * i, 'tiles', 15).setAngle(-90));

      e.explosionBody
        .push(this.physics.add.sprite(x - 32 * i, y, 'tiles', 15).setAngle(-180));

      e.explosionBody
        .push(this.physics.add.sprite(x, y + 32 * i, 'tiles', 15).setAngle(90));
    }

    //explosão fim
    e.explosionEnd
    .push(this.physics.add.sprite(x + 32 * tamBomb, y, 'tiles', 15));

    e.explosionEnd
    .push(this.physics.add.sprite(x, y - 32 * tamBomb, 'tiles', 15).setAngle(-90));

    e.explosionEnd
    .push(this.physics.add.sprite(x - 32 * tamBomb, y, 'tiles', 15).setAngle(-180));

    e.explosionEnd
    .push(this.physics.add.sprite(x, y + 32 * tamBomb, 'tiles', 15).setAngle(90));
  }

  renderExplosion(explosion: Explosion): void {
    for (let i = 0; i < 4; i++) {
      this.animateExplosion(i, explosion);
    }
  }

  animateExplosion(index: number, explosion: Explosion): void {

    const world = this.physics.world;

    if (explosion.explosionBody[index]) {
      if (!world.collide(explosion.explosionBody[index], this.staticBlocks)) {
        explosion.explosionBody[index].anims.play('explosion-side', true);

        if (this.player.alive
          && world.collide(explosion.explosionBody[index], this.player)) {
          this.player.die();
        }

        this.players.forEach((p: Player) => {
          if (p.alive && world.collide(explosion.explosionBody[index], p)) {p.die();}
        });
        this.animateExplosion(index + 4, explosion);
      }

    } else {
      if (!world.collide(explosion.explosionEnd[index % 4], this.staticBlocks)) {
        explosion.explosionEnd[index % 4].anims.play('explosion-end', true);

        if (this.player.alive
          && world.collide(explosion.explosionEnd[index % 4], this.player)) {
          this.player.die();
        }

        this.players.forEach((p: Player) => {
          if (p.alive && world.collide(explosion.explosionEnd[index % 4], p)) { p.die() }
        });
      }
    }
  }

  explode(nearBlocks: NearBlocks): void {
    if(nearBlocks){
      if (nearBlocks.r && nearBlocks.r.id === 'f') {
        nearBlocks.r.id = 'p';
        nearBlocks.r.anims.play('destroy', true);
        nearBlocks.r.once('animationcomplete', () => {
          nearBlocks.r!.destroy();
        });
      }
      if (nearBlocks.l && nearBlocks.l.id === 'f') {
        nearBlocks.l.id = 'p';
        nearBlocks.l.anims.play('destroy', true);
        nearBlocks.l.once('animationcomplete', () => {
          nearBlocks.l!.destroy();
        });
      }
      if (nearBlocks.u && nearBlocks.u.id === 'f') {
        nearBlocks.u.id = 'p';
        nearBlocks.u.anims.play('destroy', true);
        nearBlocks.u.once('animationcomplete', () => {
          nearBlocks.u!.destroy();
        });
      }
      if (nearBlocks.d && nearBlocks.d.id === 'f') {
        nearBlocks.d.id = 'p';
        nearBlocks.d.anims.play('destroy', true);
        nearBlocks.d.once('animationcomplete', () => {
          nearBlocks.d!.destroy();
        });
      }
    }
  }

  setBomb(p: Player): void {
    const {x, y}: Entity = centralize(p);            

    const dinamite = this.physics.add.sprite(x, y, 'dynamite')
    .setSize(32, 32)
    .setImmovable(true);

    const blockList = this.staticBlocks.children.entries;
    const nearBlocks: NearBlocks = {};
    const explosion: Explosion = {
      explosionEnd: [],
      explosionBody: []
    };

    blockList.forEach(b => {
      for (let i = p.tamBomb; i > 0; i--) {
        findBlock((b as SpriteWithId), dinamite, nearBlocks, i);
      }
    });
    dinamite.displayWidth = 32;
    dinamite.displayHeight = 32;
    dinamite.anims.play('dynamite', true);

    this.createExplosion(explosion, dinamite, p.tamBomb);
    this.physics.add.collider(dinamite, p);
    this.physics.add.collider(dinamite, this.player);
    this.physics.add.collider(dinamite, this.staticBlocks);
    this.physics.add.collider(dinamite, dinamite);

    //dinamite.on('explosion', this.explode.bind(this));

    dinamite.once('animationcomplete', () => {
      console.warn('entrou no evento de explosão')
      this.explode(nearBlocks);
      dinamite.anims.play('explosion', true).once('animationcomplete', () => {
        dinamite.destroy();
      });
      this.sound.play('explosion-sound');
      if (this.player.alive && this.physics.world.collide(dinamite, this.player)) {
        this.player.die();
      }

      this.players.forEach((p: Player) => {
        if (p.alive && this.physics.world.collide(dinamite, p)) { p.die(); }
      });

      this.renderExplosion(explosion);

      dinamite.on('animationcomplete', () => {
        explosion.explosionBody.forEach(e => {
          e.destroy()
        });
        explosion.explosionEnd.forEach(e => {
          e.destroy()
        });
      });
    });
  }

  buildMap(bm: BattlefieldMap): void {
    const offsetSide = 160;
    const offsetUp = 16;

    this.add.image(offsetSide, offsetUp, bm.background.key)
    .setOrigin(0, 0)
    .setScale(2.2, 2.4);

    this.anims.create({
      key: 'destroy',
      frames: this.anims.generateFrameNumbers('tiles', {start: 0, end: 7}),
      frameRate: 20,
      repeat: 0
    });

    for (let i = 0; i < 33; i++) {
      //linha horizontal superior
      this.staticBlocks.create(this.FRAME_SIZE * i + offsetSide, offsetUp, 'tiles', 7)

      //linha horizontal inferior
      this.staticBlocks.create(this.FRAME_SIZE * i + offsetSide, 18 * this.FRAME_SIZE + offsetUp, 'tiles', 7)

      if (i < 19) {
        //linha vertical quesquerda
        this.staticBlocks.create(offsetSide, i * this.FRAME_SIZE + offsetUp, 'tiles', 7)
        //linha vertical direita
        this.staticBlocks.create(this.FRAME_SIZE * 32 + offsetSide, i * this.FRAME_SIZE + offsetUp, 'tiles', 7)
      }
      //blocos indestrutíveis internos
      if (i % 2 === 0) {
        for (let j = 2; j <= 16; j += 2) {
          this.staticBlocks.create(this.FRAME_SIZE * i + offsetSide, j * this.FRAME_SIZE + offsetUp, 'tiles', 7)
        }
      }
    }
    //blocos destrutíveis
    for (const breakableBlock of bm.breakableBlocks) {
      this.staticBlocks.create(breakableBlock.x * this.FRAME_SIZE + offsetSide,
        breakableBlock.y * this.FRAME_SIZE + offsetUp,
        'tiles', 0).id = 'b';
    }
  }

  private latencyCalculator(t1: string, p: Player): number {
    const first = new Date(t1);
    const last = new Date(p.moves[0].timestamp);
    const clientTimeElapsed = first.getTime() - last.getTime();
    const serverTimeElapsed = clientDate.getTime() - new Date(p.timestamp).getTime();
    const latency = clientTimeElapsed - serverTimeElapsed;
    return latency >= 0 ? latency : 0;
  }
}