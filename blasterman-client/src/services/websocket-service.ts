import socketIO from "socket.io-client";

export default class WebSocketService {
  private static socket: SocketIO.Socket;

  static getInstance(): SocketIO.Socket {
    if(!this.socket) {
      this.socket = socketIO(process.env.API_URL);
    }
    return this.socket;
  }
}
