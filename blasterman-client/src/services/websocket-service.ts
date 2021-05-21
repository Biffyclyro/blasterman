import {io, Socket} from "socket.io-client";
import * as dotenv from 'dotenv';

export default class WebSocketService {
  private static socket: Socket;

  static getInstance(): Socket {
    if(!this.socket) {
      this.socket = io(`${process.env.API_URL}`);
    }
    return this.socket;
  }
}
