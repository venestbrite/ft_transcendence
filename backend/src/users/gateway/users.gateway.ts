import { UsersService } from './../users.service';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket, MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from "../../rooms/entities/message.entity";

import { ConfigService } from "@nestjs/config";
const service = new ConfigService();

@WebSocketGateway({
  cors: {
    origin: service.get<any>("CORS_URL"), // TO CHANGE WITH GLOBAL URL
    credentials: true
  },
})
export class UsersGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  private server: Server;

  private logger: Logger = new Logger('UsersGateway');

  @SubscribeMessage('dm')
  handleMessage(
      @ConnectedSocket() client: Socket,
      @MessageBody() message: Message,
  ): void {
    this.server.to(message.room).emit('send-message', message);
    this.usersService.storeMessage(message)
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const user = this.getUserFromSocket(client).then((res) => {
      if (!res)
        return ;
      this.usersService.updateStatus(res.id, 'offline');
    })
  }

  handleConnection(client: Socket, ...args: any[]) {
//    this.logger.log(`Client connected: ${client.id}`);
   //  this.logger.log('client data', client.data);
   // console.log('client is', client);
    // this.logger.log(client.request.headers);
    // this.logger.log(args);
    const user = this.getUserFromSocket(client).then((res) => {
      if (!res)
        return ;
      this.usersService.updateStatus(res.id, 'online');
    })
  }

  async getUserFromSocket(socket: Socket) {
		const token = socket.handshake.headers.cookie;
    if (!token)
      return ;
		var base64Url = token.split('.')[1];
    if (!base64Url)
      return ;
		var base64 = base64Url.replace('-', '+').replace('_', '/'); // to do, verify token signature 
		const parsed = JSON.parse(atob(base64));
		const user = await this.usersService.findById(parsed.id);
		return user;
		// const token = socket.handshake.headers.cookie;
	  }
}
