import {
	Controller,
	Get,
	Post,
	Body,
	Req,
	Res,
	Patch,
	Param,
	Delete,
	Request,
	UseGuards, UploadedFile, UseInterceptors, NotFoundException, BadRequestException, Logger
  } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Serialize } from 'src/users/users.interceptor';
import { UsersService } from 'src/users/users.service';
import { GameDto } from './dto/game.dto';
import { LiveGameDto } from './dto/live-game.dto';
// In ES modules
import * as sanitizeHtml from 'sanitize-html';

  
  // const utils = {
  //   getFileExtension()
  // }
  
  @Controller('games')
  @Serialize(GameDto)
  @Serialize(LiveGameDto) 
  export class GameController {
  
  
	constructor(private readonly usersService: UsersService) {}
  
	@Post()
	createGame(@Body() createGameDto: GameDto) {
	  return this.usersService.addNewGame(createGameDto);
	}
	
	@Get()
	findAll() {
	  return this.usersService.findAllGames();
	}
  
	@Get('/:id')
	findSingleGame(@Param('id') id: number) {
		// id = DOMPurify.sanitize(id);
		id = parseInt(sanitizeHtml(id.toString()));
	  return this.usersService.findGameById(id);
	}

	@Get('find/ladder')
	// @UseGuards(JwtAuthGuard)
	async getLadder() {
		return await this.usersService.getLadder();
	}

	@Get('find/live')
	async getLive() : Promise<string[]> {
		const games = await this.usersService.getLiveGames();
		const obj_ret: string[] = [];
		for (let i = 0; i < games.length; i++) {
			obj_ret.push(games[i].game_id);
		}
		return obj_ret;
	}

	@Get('find/singlelive/:id')
	async getSingleLive(@Param('id') id: string) {
		//  id = DOMPurify.sanitize(id);
		id = sanitizeHtml(id);
		const game = await this.usersService.getSingleLiveGame(id);
		return game;
	}
  
  }
  