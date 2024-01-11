import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport'
import { ConfigModule } from "@nestjs/config";
import { DatabaseConfigService } from "./database-config.service";
import { GameGateway } from './game/game.gateway';
import { GameModule } from './game/game.module';
import { GameService } from './game/game.service';
import { MessagesModule } from './messages/messages.module';
import { ChannelsModule } from './channels/channels.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
      inject: [DatabaseConfigService]
    }),
    AuthModule,
    UsersModule,
    RoomsModule,
    GameModule,
    MessagesModule,
    ChannelsModule
  ],
  controllers: [AppController],
  providers: [AppService, GameService], 
})
export class AppModule {}
