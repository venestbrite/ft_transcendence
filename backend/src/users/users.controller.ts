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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LiveGameDto } from '../game/dto/live-game.dto'
import { Serialize } from "./users.interceptor";
import { UserDto } from "./dto/user.dto";
import { AuthGuard } from '@nestjs/passport';
import { response, Response } from 'express';
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateAchiDto } from './dto/create-achi.dto';
import { AchievementDto } from './dto/achievement.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from "@nestjs/config";

import * as sanitizeHtml from 'sanitize-html';


// const utils = {
//   getFileExtension()
// }

@Controller('users')
@Serialize(UserDto)
export class UsersController {

	private logger: Logger = new Logger('UsersController');

	constructor(private readonly usersService: UsersService,
				private jwtService:JwtService,
				private configService: ConfigService) {}

	@Post()
	async create(@Body() createUserDto: CreateUserDto) {
		return await this.usersService.create(createUserDto);
	}

	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Get('/me')
	@UseGuards(JwtAuthGuard)
	findMe(@Request() req) {
		// const username = DOMPurify.sanitize(req.user.username);
		const username = sanitizeHtml(req.user.username);
		
		return  this.usersService.findOne(username);
	}

	@Get('findbyuser/:username')
	@UseGuards(JwtAuthGuard)
	findOne(@Param('username') username: string) {
		username = sanitizeHtml(username);
		if (!username)
			return null;
		return this.usersService.findByNameOrUsername(username);
	}

	@Get(':id')
	// @UseGuards(JwtAuthGuard)
		findOneBbyId(@Param('id') id) {
		//  id = DOMPurify.sanitize(id);
		id = sanitizeHtml(id);
		if (!id)
			return null;
		return this.usersService.findById(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(+id, updateUserDto);
	}

	@Patch('/:id/change-username')
	@UseGuards(JwtAuthGuard)
	async changeUsername(@Request() req, @Res() res: Response, @Param('id') id: string, @Body() {username, is_first_login}) {
		// id = DOMPurify.sanitize(id);
		// username = DOMPurify.sanitize(username);
		// is_first_login = DOMPurify.sanitize(is_first_login);
		username = sanitizeHtml(username);
		id = sanitizeHtml(id);
		let user = await this.usersService.findByNameOrUsername(username);
		console.log('user is', user.length);
		if (user.length > 0) {
			res.send('not unique');
			return ;
		}
		try {
			const res_ = await this.update(id, {
				custom_username: username,
				is_first_login: is_first_login == true ? true : false
				
			})
		}
		catch(err) {
			res.send('failed');
			return ;
		}
		// const jwt = this.jwtService.sign({username: username, id: id});
			// 		res.cookie('token', jwt, { httpOnly: true });
		res.send('approved');
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		// id = DOMPurify.sanitize(id);
		id = sanitizeHtml(id);
		if (!id) 
			return null;
		return this.usersService.remove(+id);
	}

	@Get('/:id/friends')
	async findFriends(@Param('id') id: string) {
		// id = DOMPurify.sanitize(id);
		id = sanitizeHtml(id);
		if (!id) 
			return null;
		return await this.usersService.findFriends(+id)
	}

	@Patch('/:id/add-friend') // not used 
	addFriend(@Param('id') id: string, @Body() { friendId }) {
		// id = DOMPurify.sanitize(id);
	// friendId = DOMPurify.sanitize(friendId);
		id = sanitizeHtml(id);
		friendId = sanitizeHtml(friendId);
		if (!id || !friendId) 
			return null;
		return this.usersService.addFriend(+id, friendId)
	}

	@Post('add-friend/:friendId')
	@UseGuards(JwtAuthGuard)
	async addAsFriend(@Req() req, @Param('friendId') friendId: string) {
		friendId = sanitizeHtml(friendId);
		if (!friendId)
			return null;
		return await this.usersService.addFriend(req.user.user_id, friendId);
	}

	@Patch('remove-friend/:friendId')
	@UseGuards(JwtAuthGuard)
	async removeFriend(@Req() req, @Param('friendId') friendId: string) {
		friendId = sanitizeHtml(friendId);
		if (!friendId)
			return null;
		return await this.usersService.removeFriend(req.user.user_id, friendId);
	}

	@Get('/:friendId/are-friends')
	@UseGuards(JwtAuthGuard)
	async findIfFriend(@Req() req, @Param('friendId') friendId) {
	//  friendId = DOMPurify.sanitize(friendId);
		friendId = sanitizeHtml(friendId);
		if (!friendId)
			return null;
		return await this.usersService.findIfFriends(req.user.user_id, friendId);
	}

	@Get('/:id/achievements')
	findAchievements(@Param('id') id: string) {
		id = sanitizeHtml(id);
		if (!id)
			return null;
		return this.usersService.findAchievements(+id);
	}

	@Get('/:id/wins')
	findWins(@Param('id') id: string) {
		id = sanitizeHtml(id);
		if (!id)
			return null;
		return this.usersService.findAllWins(+id);
	}

	@Get('/:id/history')
	findHistory(@Param('id') id: string) {
		id = sanitizeHtml(id);
		if (!id)
			return null;
		return this.usersService.findAllGamesPlayed(+id);
	}

	@Patch('/:id/add-achievement')
	addAchievement(@Param('id') id: string, @Body() { achiId }) {
		id = sanitizeHtml(id);
		if (!id || !achiId)
			return null;
		return this.usersService.addAchievement(+id, achiId);
	}

	@Get('login')
	@UseGuards(AuthGuard('api42'))
	async login(@Req() req, @Res() res: Response) {
		return req.user;
	}

	@Get('find/ladder')
	findLadder() {
		return this.usersService.getLadder();
	}

	@Get('find/livegames')
	async findLiveGames() {
		return this.usersService.getLiveGames();
		// const games = await this.usersService.getLiveGames();
		// let obj_to_ret = [];
		// for(let i = 0; i < games.length; i++) {
		//   const obj = {
		//     player_1_id: games[i].user_1_id,
		//     player_2_id: games[i].user_2_id,
		//     game_id: games[i].game_id
		//   }
		//   obj_to_ret.push(obj);
		// }
		// console.log(obj_to_ret);
		// return obj_to_ret[0].player_1_id;
	}

	@Get('is-blocked/:id')
	@UseGuards(JwtAuthGuard)
	checkIfBlocked(@Req() req, @Param('id') id) {
		if (!id)
			return false;
		return this.usersService.isBlocked(id, req.user);
	}
	@Post('avatar/:username')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('avatar', {
		storage: diskStorage({
		destination: function (req, file, cb) {
			const path = process.env.AVATAR_PATH
			fs.mkdirSync(path, {
			recursive: true
			})
			cb(null, path);
		},
		filename: (req, file, cb) => {
			const filename = file.originalname.split(".")
			const extension = filename[filename.length - 1]
			cb(null, `${req.params.username}.${extension}`)
		}
		}),
		fileFilter: (req, file, callback) => {
		let ext = path.extname(file.originalname);
		if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg')
			callback(new BadRequestException('Only images are allowed'), false)
		else
			callback(null, true)
		},
	}))
	// @UseInterceptors(FileInterceptor('avatar'))
	async avatarUpload(@Param('username') username: string, @UploadedFile() file: Express.Multer.File) {
		//  username = DOMPurify.sanitize(username);
		username = sanitizeHtml(username);
		if (!username) 
			return null;
		const user = await this.usersService.findOne(username)
		if (!user) {
			fs.rm(`avatars/${file.filename}`, (err) => null)
			throw new NotFoundException()
		}
		user.avatar = this.configService.get<string>("BASE_URL") + '/' + file.filename;
		await this.usersService.update(user.id, user)
		return user;
	}

	@Patch('block/user')
	@UseGuards(JwtAuthGuard)
	blockUser(@Req() req, @Body() {userId}) {
		// userId = DOMPurify.sanitize(userId);
		if (!userId)
			return null;
		return this.usersService.blockUser(userId, req.user);
	}

	@Patch('unblock/user')
	@UseGuards(JwtAuthGuard)
	unblockUser(@Req() req, @Body() {userId}) {
		// userId = DOMPurify.sanitize(userId);
		if (!userId)
			return null;
		return this.usersService.unBlockUser(userId, req.user);
	}


	/*************** DEBUTG ONLY DELETE WHEN PUSH  ***********/
	@Get('logmein/test')
	testLogin(@Req() req, @Res() res: Response) {
		const jwt = this.jwtService.sign({username: "test", id: 4});
			res.cookie('token', jwt, { httpOnly: true });
		res.send("logged in"); 
	}

	@Get('logmein/toldo')
	testToldo(@Req() req, @Res() res: Response) {
		const jwt = this.jwtService.sign({username: "toldo", id: 3});
			res.cookie('token', jwt, { httpOnly: true });
		res.send("logged in"); 
	}
}
