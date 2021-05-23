import cors from "cors";
import express from "express";
import RoomManager from './room';
import socketIO from "socket.io";
import router from './utils/controllers';
import {idGenerator, battleFieldMap} from './utils/engines';
import {Player, PlayerCommand, Movement, isMovement} from './entities';


export interface ObjectDto<T> {
  info?: string;
  data?: T;
}

const port = 8090 
const app: express.Application = express();
export const rooms = new Map<string, RoomManager>();

app.use(express.json());
const corsOptions = {
  origin: '*',
}

app.use(cors());
app.use('/', router);
app.use(express.static('assets'));
const server = app.listen(port);

const io = new socketIO.Server(server, {
//  path: '/teste',
  cors: {
    origin: 'http://localhost:8000', 
    methods: ["GET", "POST"]
  }
});

//@ts-ignore
io.engine.generateId = (req: any) => {
  return idGenerator();
}

io.on("connection", socket => {
  socket.on('enter-room', ( enterRequest: ObjectDto<string>) => {

    let roomId = enterRequest.info;
    console.log(roomId);
    if (!roomId) {
      roomId = idGenerator();
    }
    let room = rooms.get(roomId);
    const player = {
      playerId: socket.id
    }

    if(!room) {
      room = new RoomManager(io, roomId, battleFieldMap);
      rooms.set(roomId, room);
    }
    socket.join(roomId);
    room!.addPlayer(player, enterRequest.data!);
    console.log(`conecatado na sala ${roomId}`);
    const res = {
      info: roomId,
      data: player.playerId,
    };
    socket.send(res);
  });

  socket.on('command', (commandRequest: ObjectDto<PlayerCommand>) => {
    const roomId: string | undefined = commandRequest.info;
    const playerCommand: PlayerCommand | undefined = commandRequest.data;
    let room: RoomManager | undefined ;

    if (roomId) {
      room = rooms.get(roomId);
    }

    if (room && playerCommand){
      const id = socket.id;
      playerCommand.playerId = id;
      const player = room.getPlayer(id);
      if (player) {
        if (isMovement(playerCommand.command)) {
          room.addMove(playerCommand); 
        } else {
          room.setBomb(playerCommand.command, player);
        }
      }
    }
  });

  socket.on('ok', (okRequest: ObjectDto<string>) => {
    const room = rooms.get(okRequest.info!);
    room!.playerReady();
  })
});
