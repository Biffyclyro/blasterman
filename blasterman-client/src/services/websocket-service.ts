import {io, Socket} from "socket.io-client";
import {API_URL} from '../utils/engines';


export default class WebSocketService {
  private static socket: Socket;

  static get INSTANCE(): Socket {
    if(!WebSocketService.socket) {
      WebSocketService.socket = io(`${API_URL}`);
    }
    return WebSocketService.socket;
  }
}
