import { UsersGateway } from './gateway/users.gateway';
import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from "../auth/auth.module";
import { Achievement } from './entities/achievement.entity';
import { AchievementController } from './achievements.controller';
import { Game } from 'src/game/entities/game.entity';
import { LiveGame } from 'src/game/entities/live-game.entity';
import { Notification } from 'src/messages/entities/notification.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Achievement]), // unite with up
        TypeOrmModule.forFeature([Game]), // unite with up,
        TypeOrmModule.forFeature([LiveGame]),
        TypeOrmModule.forFeature([Notification]),
        HttpModule,
        forwardRef(() => AuthModule)
    ],
    controllers: [UsersController, AchievementController],
    providers: [
        UsersGateway,
        UsersService
    ],
    exports: [UsersService]
})
export class UsersModule {}
