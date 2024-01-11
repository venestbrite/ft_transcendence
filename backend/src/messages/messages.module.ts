import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';


import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PrivateMessage } from './entities/private-message.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrivateMessage]),
    TypeOrmModule.forFeature([Notification])
  ],
  controllers: [MessagesController],
  providers: [MessagesService]
})
export class MessagesModule {}
