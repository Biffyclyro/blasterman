import socketIO from "socket.io";
import express from "express";
import cors from "cors";

const port = 8080;
const app: express.Application = express();

app.use(express.json());
const corsOptions = {
    origin: '*',
}


app.use(cors());
const server = app.listen(port);

const io = new socketIO.Server(server, {
  cors: {
    origin: "http://localhost:8090",
    methods: ["GET", "POST"]
  }
});

io.on("connection", socket => {
    console.log('rolou');
    socket.on('enter_room', room => {
        socket.join(room);
        console.log(`conecatado na sala ${room}`);
    })
});
