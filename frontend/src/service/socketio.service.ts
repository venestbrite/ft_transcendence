import { io } from 'socket.io-client';

class SocketioService {
  socket;
  constructor() {}

  setupSocketConnection() {
    this.socket = io(this.$base_url, {
      withCredentials: true
    });
    this.socket.connect();
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketioService();