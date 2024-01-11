import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { Game } from './entities/game.entity';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './game.controller'

@Module({
  providers: [GameService, GameGateway],
  imports: [UsersModule],
  controllers: [GameController]
})
export class GameModule {}
