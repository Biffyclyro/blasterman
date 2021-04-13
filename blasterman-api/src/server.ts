import socketIO from "socket.io";
import express from "express";
import cors from "cors";
import RoomManager from './room.ts';

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
    socket.on('enter_room', (roomId: string) => {
      const room = rooms.get(roomId);

      if(room) {
        rooms.set(roomId, new RoomManager());
      }

        socket.join(roomId);
        console.log(`conecatado na sala ${roomId}`);
    })
});
