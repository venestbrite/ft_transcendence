import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto } from './dto/join-room.dto';
import { Room } from "./entities/room.entity";

@Injectable()
export class RoomsService {
  private rooms: Set<string> = new Set()

  join(room: JoinRoomDto, client: Socket) {
    this.rooms.add(room.name)
    client.join(room.name)
  }

  sendMessage(server: Server, message: any, clientId: string) {
    if (server.of("/").adapter.rooms.get(message.room)?.has(clientId))
      server.to(message.room).emit('send-message', message.body)
  }

  findAll() {
    return Array.from(this.rooms.keys());
  }

  findOne(name: string) {
    return Array.from(this.rooms.keys()).filter(a => a === name);
  }

  leave(room: JoinRoomDto, client: Socket, server: Map<string, Set<String>>) {
    if (server.get(room.name).size < 2)
      this.rooms.delete(room.name)
    client.leave(room.name)
  }
}
