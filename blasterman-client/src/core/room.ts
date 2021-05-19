import {Sprite} from 'phaser'; 
import {NearBlocks, ObjectDto, Player, EnterRoomInfo} from '../entities';
import socketIO from "socket.io-client";
 

dotenv.config();

export default class Room extends Phaser.Scene {
  staticBlocks = this.physics.add.staticBlocks();
  infos: EnterRoomInfo;
  readonly FRAME_SIZE = 32;
  readonly socket: SocketIO.Socket;
  player: Player;

  init(infos: EnterRoomInfo): void {
    this.infos = infos;
  }

  preload(): void {
    this.load.audio('explosion-sound', './assets/sounds/explosion.mp3');
    this.load.spritesheet('tiles', `${process.env.API_URL}/assets/${this.battlefieldMap.tiles}/tiles-area01.png`, {
      frameHeight: 32,
      frameWidth: 32
    });
    this.load.image(this.battlefieldMap.background.key, 
      this.battlefieldMap.background.url); 
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
  }

  create(): void {
    this.anims.create({
      key: 'dynamite',
      frames: this.anims.generateFrameNumbers('dynamite', {start: 0, end: 10}),
      framRate: 15,
      repeat: 0
    });
    this.anims.create({
      key: 'explosion',
      frames: this.anims.generateFrameNumbers('tiles', {start: 16, end: 23}),
      framRate: 15,
      repeat: 0
    });
    this.anims.create({
      key: 'explosion-side',
      frames: this.anims.generateFrameNumbers('tiles', {start: 8, end: 15}),
      framRate: 15,
      repeat: 0
    });
    this.anims.create({
      key: 'explosion-end',
      frames: this.anims.generateFrameNumbers('tiles', {start: 24, end: 31}),
      framRate: 15,
      repeat: 0
    });

    this.player = this.addEntity(new Player(this, infos.player))
                      .setSize(9, 10)
                      .setOffset(8, 10);

    this.buildMap(this.infos.map);
  }

  addEntity<T extends Phaser.GameObjects.GameObject>(e: T): T{
    this.add.existing(e);
    this.physics.add.existing(e);
    this.physics.add.collider(this.staticBlocks, e);
    return e;
  }

  createExplosion(e: Explosion, {x, y}: Sprite, tamBomb: number): void {
    const corpo = this.tamBomb - 1;

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

    const world = this.scene.physics.world;

    if (explosion.explosionBody[index]) {
      if (!world.collide(explosion.explosionBody[index], this.scene.staticBlocks)) {
        explosion.explosionBody[index].anims.play('explosion-side', true);

        if (this.scene.player.alive
          && this.scene.physics.world.collide(explosion.explosionBody[index], this.scene.player)) {

          this.scene.player.killNotify();
        }

        this.scene.room.players.forEach((p: Player) => {
          if (p.alive && world.collide(explosion.explosionBody[index], p)) p.killNotify();
        });

        this.animateExplosion(index + 4, explosion);
      }

    } else {
      if (!world.collide(explosion.explosionEnd[index % 4], this.scene.staticBlocks)) {
        explosion.explosionEnd[index % 4].anims.play('explosion-end', true);

        if (this.scene.player.alive
          && this.scene.physics.world.collide(explosion.explosionEnd[index % 4], this.scene.player)) {

          this.scene.player.killNotify();
        }

        this.scene.room.players.forEach((p: Player) => {
          if (p.alive && world.collide(explosion.explosionEnd[index % 4], p)) p.killNotify();
        });
      }
    }
  }

  explode(nearBlocks: NearBlocks): void {
    if (blocosVizinhos.r != undefined && blocosVizinhos.r.id == 'f') {
      blocosVizinhos.r.id = 'p';
      blocosVizinhos.r.anims.play('destroy', true);
      blocosVizinhos.r.once('animationcomplete', () => {
        blocosVizinhos.r.destroy();
      });
    }
    if (blocosVizinhos.l != undefined && blocosVizinhos.l.id == 'f') {
      blocosVizinhos.l.id = 'p';
      blocosVizinhos.l.anims.play('destroy', true);
      blocosVizinhos.l.once('animationcomplete', () => {
        blocosVizinhos.l.destroy();
      });
    }
    if (blocosVizinhos.u != undefined && blocosVizinhos.u.id == 'f') {
      blocosVizinhos.u.id = 'p';
      blocosVizinhos.u.anims.play('destroy', true);
      blocosVizinhos.u.once('animationcomplete', () => {
        blocosVizinhos.u.destroy();
      });
    }
    if (blocosVizinhos.d != undefined && blocosVizinhos.d.id == 'f') {
      blocosVizinhos.d.id = 'p';
      blocosVizinhos.d.anims.play('destroy', true);
      blocosVizinhos.d.once('animationcomplete', () => {
        blocosVizinhos.d.destroy();
      });
    }
  }

  setBomb(p: Player): void {
    {x, y}: Entity = centralize(p);            

    let dinamite = this.physics.add.sprite(x, y, 'dynamite')
    .setSize(32, 32)
    .setImmovable(true);

    const blockList = this.staticBlocks.childer.entries;
    let nearBlocks: NearBlocks = {};
    let explosion: Explosion = {
      explosionEnd: [],
      explosionBody: []
    };

    blockList.forEach(b => {
      for (let i = p.tamBomb: i > 0; i--) {
        findBlock(b, dinamite, nearBlocks, i);
      }
    });
    dinamite.displayWidth = 32;
    dinamite.displayHeight = 32;
    dinamite.anims.play('dynamite', true);

    this.createExplosion(explosion, dinamite, p.tamBomb);
    this.scene.physics.add.collider(dinamite, p);
    this.scene.physics.add.collider(dinamite, this.staticBlocks);
    this.scene.physics.add.collider(dinamite, dinamite);
    this.scene.physics.add.collider(this.explosions, this.staticBlocks);

    dinamite.on('explosion', this.explode.bind(this));

    dinamite.once('animationcomplete', () => {
      dinamite.once('explode', nearBlocks);
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
    let offsetSide = 160;
    let offsetUp = 16;

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
        .setDisplaySize(32, 32)
        .setSize(32, 32);

      //linha horizontal inferior
      this.staticBlocks.create(FRAME_SIZE * i + offsetSide, 18 * FRAME_SIZE + offsetUp, 'tiles', 7)
        .setDisplaySize(32, 32)
        .setSize(32, 32);

      if (i < 19) {
        //linha vertical quesquerda
        this.staticBlocks.create(offsetSide, i * FRAME_SIZE + offsetUp, 'tiles', 7)
          .setDisplaySize(32, 32)
          .setSize(32, 32);
        //linha vertical direita
        this.staticBlocks.create(FRAME_SIZE * 32 + offsetSide, i * FRAME_SIZE + offsetUp, 'tiles', 7)
          .setDisplaySize(32, 32)
          .setSize(32, 32);
      }
      //blocos indestrutíveis internos
      if (i % 2 === 0) {
        for (let j = 2; j <= 16; j += 2) {
          this.staticBlocks.create(FRAME_SIZE * i + offsetSide, j * FRAME_SIZE + offsetUp, 'tiles', 7)
            .setDisplaySize(32, 32)
            .setSize(32, 32);
        }
      }
    }
    //blocos destrutíveis
    for (let breakableBLock of c.blocksBreakable) {
      this.staticBlocks.create(breakableBLock.x * FRAME_SIZE + offsetSide,
        breakableBLock.y * FRAME_SIZE + offsetUp,
        c.key, ).setDisplaySize(32, 32).setSize(32, 32).id = 'b';
    }
  }
}
