import cors from "cors";
import express from "express";
import RoomManager from './room';
import socketIO from "socket.io";
import router from './utils/controllers';
import {idGenerator, battleFieldMap} from './utils/engines';
import {Player, PlayerCommand, Movement, isMovement} from './entities';
import * as dotenv from 'dotenv';


export interface ObjectDto<T> {
  info?: string;
  data?: T;
}

dotenv.config();
const port = process.env.API_PORT;
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
  path: '/teste',
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

//@ts-ignore
io.engine.generateId = (req: any) => {
  return idGenerator();
}

io.on("connection", socket => {
  socket.on('enter_room', ( enterRequest: ObjectDto<Player>) => {

    let roomId = enterRequest.info;
    if (!roomId) {
      roomId = `room-${idGenerator()}`;
    }
    const room = rooms.get(roomId);
    const player: Player | undefined = enterRequest.data;

    if(player) {
      player.playerId = socket.id;
      if(!room) {
        const r = new RoomManager(io, roomId, battleFieldMap);
        rooms.set(roomId, r);
      }
      socket.join(roomId);
      room!.addPlayer(player);
      console.log(`conecatado na sala ${roomId}`);
      socket.send({info: socket.id, data: battleFieldMap});
    }
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
});
