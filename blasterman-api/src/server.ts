import socketIO from "socket.io";
import express from "express";
import cors from "cors";
import RoomManager from './room.ts';
import {Player, PlayerCommand, Movement, isMovement} from './entities';


interface ObjectDto<T> {
  info?: string;
  data?: T;
}

const port = 8080;
const app: express.Application = express();
const rooms = new Map<string, RoomManager>();

app.use(express.json());
const corsOptions = {
    origin: '*',
}


app.use(cors());
const server = app.listen(port);

const io = new socketIO.Server(server, {
  path: '/teste',
  cors: {
    origin: "http://localhost:8090",
    methods: ["GET", "POST"]
  }
});

io.on("connection", socket => {
    socket.on('enter_room', ( enterRequest: ObjectDto<Player>) => {
      
      let roomId = enterRequest.info;
      if (!roomId) {
        roomId = '1';
      }
      const room = rooms.get(roomId);
      const player: Player | undefined = enterRequest.data;

      if(player) {

        if(!room) {
          rooms.set(roomId, new RoomManager());
        }
        socket.join(roomId);
        room!.addPlayers(player);
        console.log(`conecatado na sala ${roomId}`);
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
        if (isMovement(playerCommand.command)) {
          room.addMove(playerCommand); 
        } else {
          room.setBomb(playerCommand.command);
        }
      }
    });

});

