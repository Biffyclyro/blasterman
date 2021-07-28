import cors from "cors";
import express from "express";
import RoomManager from './game/room';
import router from './server-core/controllers';
import {socketHandler} from "./server-core/socket-handler"
import "./server-core/db-connection";

export interface ObjectDto<T> {
  info?: string;
  data?: T;
}

const port = 8090 
const app: express.Application = express();
export const rooms = new Map<string, RoomManager>();

app.use(express.json());
/*const corsOptions = {
  origin: '*',
}
*/
app.use(cors());
app.use(router);
app.use(express.static('assets'));
export const server = app.listen(port);
socketHandler(server);