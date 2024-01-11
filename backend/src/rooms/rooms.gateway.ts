import { Logger } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { RoomsService } from './rooms.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { Server, Socket } from 'socket.io';
import { join } from 'path/posix';

@WebSocketGateway({
  cors: true 
})
export class RoomsGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly roomsService: RoomsService) {}

  @SubscribeMessage('join-room')
  create(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket
  ) {
    this.roomsService.join(joinRoomDto, client)
  }

  @SubscribeMessage('send-message')
  send(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket
  ) {
    this.roomsService.sendMessage(this.server, message, client.id)
  }

  @SubscribeMessage('send-private-message')
  sendPrivate(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket) {
      this.server.to(message.room).emit('private-message', message.body);
  }

  @SubscribeMessage('find-all-rooms')
  findAll() {
    return this.roomsService.findAll();
  }

  @SubscribeMessage('find-one-room')
  findOne(@MessageBody() name: string) {
    return this.roomsService.findOne(name);
  }

  // @SubscribeMessage('updateRoom')
  // update(@MessageBody() updateRoomDto: any) {
  //   return this.roomsService.update(updateRoomDto.id, updateRoomDto);
  // }

  @SubscribeMessage('leave-room')
  leave(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket
  ) {
    this.roomsService.leave(joinRoomDto, client, this.server.of("/").adapter.rooms);
  }
}
