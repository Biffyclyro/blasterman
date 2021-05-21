import 'phaser'; 
import WebSocketService from '../services/websocket-service';
import {loading, centralize, findBlock} from '../utils/engines';
import {NearBlocks, ObjectDto, Player, EnterRoomInfo, Explosion, Entity, BattlefieldMap, SpriteWithId} from '../entities';
import * as dotenv from 'dotenv';
 

dotenv.config();

export default class Room extends Phaser.Scene {
  player: Player;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  infos: EnterRoomInfo;
  players: Player[] = [];
  staticBlocks = this.physics.add.staticGroup();
  readonly FRAME_SIZE = 32;
  readonly socket = WebSocketService.getInstance();

  constructor() {
    super('Room');
  }

  init(infos: EnterRoomInfo): void {
    this.infos = infos;
  }

  preload(): void {
    this.load.audio('explosion-sound', './assets/sounds/explosion.mp3');
    this.load.spritesheet('tiles', 
      `${process.env.API_URL}/assets/${this.infos.map.tiles}/tiles-area01.png`, 
      {frameHeight: 32, frameWidth: 32});
    this.load.image(this.infos.map.background.key, 
      this.infos.map.background.url); 
    this.load.spritesheet('dynamite', './assets/dinamite.png',{
      frameHeight: 32,
      frameWidth: 32
    });
    this.load.spritesheet('chris', `${process.env.API_URL}/assets/characters/chris.png`, {
      frameHeight: 32,
      frameWidth: 32
    }); 
    this.load.spritesheet('cop', `${process.env.API_URL}/assets/characters/cop.png`, {
      frameHeight: 32,
      frameWidth: 32
    }); 
    
    this.events.emit('end-loading');
  }

  create(): void {
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

    this.player = this.addEntity(new Player(this, this.infos.player!))
    .setSize(9, 10)
    .setOffset(8, 10);

    this.infos.players.forEach(p => {
      const player = this.addEntity(new Player(this, p))
                .setSize(9, 10)
                .setOffset(8, 10);
      this.players.push(player);
    });

    this.buildMap(this.infos.map);
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(): void {
    this.players.forEach(p => {
      if(p != undefined && p.alive) {
        p.move();
      }
    });

    if(this.player != undefined) {
      this.player.localCommands(this.cursors);
      this.player.move();
    }
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
        .push(this.physics.add.sprite(x + 32 * i, y, 'block', 15));

      e.explosionBody
        .push(this.physics.add.sprite(x, y - 32 * i, 'block', 15).setAngle(-90));

      e.explosionBody
        .push(this.physics.add.sprite(x - 32 * i, y, 'block', 15).setAngle(-180));

      e.explosionBody
        .push(this.physics.add.sprite(x, y + 32 * i, 'block', 15).setAngle(90));
    }

    //explosão fim
    e.explosionEnd
    .push(this.physics.add.sprite(x + 32 * tamBomb, y, 'block', 15));

    e.explosionEnd
    .push(this.physics.add.sprite(x, y - 32 * tamBomb, 'block', 15).setAngle(-90));

    e.explosionEnd
    .push(this.physics.add.sprite(x - 32 * tamBomb, y, 'block', 15).setAngle(-180));

    e.explosionEnd
    .push(this.physics.add.sprite(x, y + 32 * tamBomb, 'block', 15).setAngle(90));
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
          && this.physics.world.collide(explosion.explosionBody[index], this.player)) {

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
          && this.physics.world.collide(explosion.explosionEnd[index % 4], this.player)) {

          this.player.die();
        }

        this.players.forEach((p: Player) => {
          if (p.alive && world.collide(explosion.explosionEnd[index % 4], p)) p.die();
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
    this.physics.add.collider(dinamite, this.staticBlocks);
    this.physics.add.collider(dinamite, dinamite);

    dinamite.on('explosion', this.explode.bind(this));

    dinamite.once('animationcomplete', () => {
      dinamite.once('explode', () => {this.explode(nearBlocks)});
      dinamite.anims.play('explosion', true).once('animationcomplete', () => {
        dinamite.destroy();
      });
      this.sound.add('explosion').play();

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
        'tiles', 8).id = 'b';
    }
  }
}
