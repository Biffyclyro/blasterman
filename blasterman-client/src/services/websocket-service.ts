import {io, Socket} from "socket.io-client";
import {API_URL} from '../utils/engines';


export default class WebSocketService {
  private static socket: Socket;

  static getInstance(): Socket {
    if(!this.socket) {
      this.socket = io(`${API_URL}`);
    }
    return this.socket;
  }
}
