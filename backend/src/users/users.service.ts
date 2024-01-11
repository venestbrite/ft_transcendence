import { HttpService } from '@nestjs/axios';
import  { AxiosResponse } from 'axios'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { map, Observable } from 'rxjs';
import { Repository, Like, ILike } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Message } from "../rooms/entities/message.entity";
import { JwtService } from '@nestjs/jwt'
import { Achievement } from './entities/achievement.entity';
import { CreateAchiDto } from './dto/create-achi.dto';
import { Game } from 'src/game/entities/game.entity';
import { GameDto } from 'src/game/dto/game.dto';
import { LiveGame } from 'src/game/entities/live-game.entity';
import { LiveGameDto } from 'src/game/dto/live-game.dto'; 

// In ES modules
import * as sanitizeHtml from 'sanitize-html';
import { Notification } from 'src/messages/entities/notification.entity';


let achievements_created: Boolean = false;

const achievements_list = [
{},
{
	title: "Good Boy",
	description: "Won your first game",
	image: "achievements/first-win.png"
},
{
	title: "Champ",
	description: "Won 5+ Games",
	image: "achievements/five-wins.png",
},
{
	title: "NewBorn",
	description: "Played your first match",
	image: "achievements/first-match.png",
},
{
	title: "Veteran",
	description: "Played 3+ matches",
	image: "achievements/third-match.png",
},
]

@Injectable()
export class UsersService {
constructor(
	@InjectRepository(User) private usersRepository: Repository<User>,
	@InjectRepository(Achievement) private achieveRepository: Repository<Achievement>,
	@InjectRepository(Game) private gameRepository: Repository<Game>,
	@InjectRepository(LiveGame) private liveGameRepository: Repository<LiveGame>,
	@InjectRepository(Notification) private notificationRepository: Repository<Notification>,
	private jwtService:JwtService
) {
}

	public async getJwtToken(user: User): Promise<string>{
		const payload = {
			...user
		}
		return this.jwtService.signAsync(payload);
	}

	async create(createUserDto: CreateUserDto) {
		createUserDto.avatar = sanitizeHtml(createUserDto.avatar);
		createUserDto.custom_username = sanitizeHtml(createUserDto.custom_username);
		createUserDto.oauthToken = sanitizeHtml(createUserDto.oauthToken);
		createUserDto.username = sanitizeHtml(createUserDto.username);
		return await this.usersRepository.save(createUserDto);
	}

	async createAchi(createAchiDto: CreateAchiDto) {
		return await this.achieveRepository.save(createAchiDto);
	}

	generate(user: Partial<CreateUserDto>) {
		return this.usersRepository.create(user)
	}

	async findAll() {
		return await this.usersRepository.find();
	}

	async findAllAchivements(): Promise<Achievement[]> {
		return await this.achieveRepository.find();
	}

	findAchiById(id: number) {
	// id = DOMPurify.sanitize(id);
		id = parseInt(sanitizeHtml(id.toString()));
		if (!id)
			return ;
		return this.findAchievements(id);
	}

	async findGameById(id: number) {
	//   id = DOMPurify.sanitize(id);
		id = parseInt(sanitizeHtml(id.toString()));
		return await this.gameRepository.findOne(id);
	}

	async findAllGames(): Promise<Game[]> {
		return await this.gameRepository.find();
	}

	async findOne(username: string) {
		// username = DOMPurify.sanitize(username);
		username = sanitizeHtml(username);

		return await this.usersRepository.findOne({ username });
	}

	async findByNameOrUsername(username) {
		/* let user = await this.usersRepository.find({
		where: [ 
			{username: username}, 
			{custom_username: username}
			],
		});
		if (user)
		return user;
		else
		return null; */
		// username = DOMPurify.sanitize(username);
		username = sanitizeHtml(username);
		return await this.usersRepository.find({
			where: [
				{ username: ILike(username + "%") },
				{ custom_username: ILike(username + "%")}
			]
		});
	}

	async findAllWins(id) { // maybe better with username 
		// id = DOMPurify.sanitize(id);
		id = parseInt(sanitizeHtml(id.toString()));
		return await this.gameRepository.find({
			where: {
				winner_id: id
			}
		});
	}

	async findAllGamesPlayed(id) {
	// id = DOMPurify.sanitize(id);
	id = parseInt(sanitizeHtml(id.toString()));
		return await this.gameRepository.find({
			where: [ // uses OR sql operator
				{  winner_id: id },
				{ loser_id: id }
			]
		});
	}

	async findById(id: number) {
		id = parseInt(sanitizeHtml(id.toString()));
		return await this.usersRepository.findOne(id);
	}

	update(id: number, updateUserDto: UpdateUserDto) {
		id = parseInt(sanitizeHtml(id.toString()));
		return this.usersRepository.update(id, updateUserDto);
	}

	remove(id: number) {
		id = parseInt(sanitizeHtml(id.toString()));

			return this.usersRepository.delete(id);
	}

	async findFriends(id: number) {

		id = parseInt(sanitizeHtml(id.toString()));
		if (!id)
			return 'failed';
		const user = await this.usersRepository.findOne(id);
		if (!user)
			return 'failed';
		if (!user.friends)
			return ;
		const friends = user.friends;
		let to_return = [];
		for(let i = 0; i< friends.length; i++) {
			let user_to_insert = null;
			try {
				user_to_insert = await this.usersRepository.findOne(friends[i]);
			}
			catch (err) {
				user_to_insert = null;
			}
			if (user_to_insert)
				to_return.push(user_to_insert);
		}
		return to_return;
	}

	findAchievements(id: number) {
		id = parseInt(sanitizeHtml(id.toString()));
		if ((id > 0) && (id < 5)) {
			return achievements_list[id];
		}
		return null;
	}


	async addFriend(id, friendId) {
		id = parseInt(sanitizeHtml(id.toString()));
		friendId = parseInt(sanitizeHtml(friendId.toString()));

		const user = await this.usersRepository.findOne(id);
		const friend = await this.usersRepository.findOne(friendId);
		let friends = user.friends;

		const friend_id = parseInt(friendId);

		if (!user || !friend || !friend_id)
			return 'failed';
		if (!friends) {
			friends = [];
		}
		if (!(friends.includes(friend_id))) {
			friends.push(friend_id);
		}
		this.usersRepository.update(id, { friends: friends });

		let new_friends: number[] = friend.friends;
		if (!new_friends) {
			new_friends = [];
		}
		if (!(new_friends.includes(id))) {
			new_friends.push(id);
		}
		this.usersRepository.update(friend_id, {friends: new_friends});

		return 'done';
	}

	async removeFriend(id, friendId) {

		id = parseInt(sanitizeHtml(id.toString()));
		friendId = parseInt(sanitizeHtml(friendId.toString()));

		const user = await this.usersRepository.findOne(id);
		const friend = await this.usersRepository.findOne(friendId);
		let friends = user.friends;
		let new_friends = friend.friends;
		let removed : number[];

		const friend_id = parseInt(friendId);
		
		if (!user || !friend || !friend_id)
			return 'failed';
		
		if (!friends || !new_friends) {
			return 'failed';
		}
		const index = friends.indexOf(friend.id);
		if (index != -1) {
			if (index == 0)
				friends.shift();
			else
				friends = friends.splice(index, 1);
			this.usersRepository.update(id, { friends: friends });
		}
		const index_friend = new_friends.indexOf(user.id);
		removed = [];
		if (index_friend != -1) {
			if (index_friend == 0) {
				new_friends.shift();
				removed = new_friends;
			} else {
				removed = new_friends.slice(index_friend, 1);
			}
			this.usersRepository.update(friend.id, {friends: removed});
		}
		return 'done';
	}

	async findIfFriends(id, friendId) {
		id = parseInt(sanitizeHtml(id.toString()));
		friendId = parseInt(sanitizeHtml(friendId.toString()));

		if (!id || !friendId)
			return 'failed';
		const user = await this.usersRepository.findOne(id);
		const friend = await this.usersRepository.findOne(friendId);

		const friend_id = parseInt(friendId);

		if (!user || !friend || !friend_id)
			return 'failed';

		if (user.friends && friend.friends) {
			if (user.friends.includes(friend_id) && friend.friends.includes(id))
				return true;
			else
				return false;
		}
		else
			return false;
	}

	async blockUser(user_id_to_block, user_obj) {
		user_id_to_block = parseInt(sanitizeHtml(user_id_to_block.toString()));
		user_obj.user_id = parseInt(sanitizeHtml(user_obj.user_id.toString()));
		if (!user_id_to_block || !user_obj || !user_obj.user_id)
			return 'failed';
		const user = await this.usersRepository.findOne(user_obj.user_id);
		if (!user)
			return 'failed';
		if (user.friends) {
			if (user.friends.includes(user_id_to_block)) {
				const index = user.friends.indexOf(user_id_to_block);
				if (index != -1) {
				user.friends = user.friends.splice(index, 1);
				}
			}
		}
		if (!user.blocked_users.includes(user_id_to_block))
			user.blocked_users.push(user_id_to_block);
		this.usersRepository.update(user_obj.user_id, {friends: user.friends, blocked_users: user.blocked_users});
		return 'OK';
	}

	async unBlockUser(user_id_to_unblock, user_obj) {
		user_id_to_unblock = parseInt(sanitizeHtml(user_id_to_unblock.toString()));
		user_obj.user_id = parseInt(sanitizeHtml(user_obj.user_id.toString()));
		if (!user_id_to_unblock || !user_obj)
			return 'failed';
		const user = await this.usersRepository.findOne(user_obj.user_id);
		const id_to_unblock = parseInt(user_id_to_unblock);
		let new_blocked: number[] = [];
		if (!user || !id_to_unblock)
			return 'failed';
		if (user.blocked_users.includes(id_to_unblock)) {
		const index = user.blocked_users.indexOf(id_to_unblock)
		if (index == 0) {
			user.blocked_users.shift();
			new_blocked = user.blocked_users;
		}
		else {
			new_blocked = user.blocked_users.splice(index, 1);
		}
		this.usersRepository.update(user.id, {blocked_users: new_blocked});
		}
		return 'OK';
	}

	async isBlocked(user_id, user_obj) { //checks if user_obj (is userLoggedIn) is blocked from user_id
	//  user_id = DOMPurify.sanitize(user_id);
	//  user_obj.user_id = DOMPurify.sanitize(user_obj.user_id);

		user_id = parseInt(sanitizeHtml(user_id.toString()));
		user_obj.user_id = parseInt(sanitizeHtml(user_obj.user_id.toString()));

		if (!user_id || !user_obj)
			return false;
		const user = await this.usersRepository.findOne(user_obj.user_id);
		if (!user)
			return false;
		if (user.blocked_users.includes(parseInt(user_id)))
			return true;
		return false;
	}

	async getNumOfGamePlayed(user_id) {
		// user_id = DOMPurify.sanitize(user_id);
		user_id = parseInt(sanitizeHtml(user_id.toString()));
		const user = await this.usersRepository.findOne(user_id);
		if (!user)
			return null;
		const num_of_games = await this.gameRepository.find({
			where: [
				{user_1_id: user_id},
				{user_2_id: user_id}
			]
		});
		return num_of_games.length;
	}

	async addAchievement(id: number, achiId) {
	// id = DOMPurify.sanitize(id);
	//  achiId = DOMPurify.sanitize(achiId);
		id = parseInt(sanitizeHtml(id.toString()));
		achiId = parseInt(sanitizeHtml(achiId.toString()));
		const user = await this.findById(id); 
		user.achievements = user.achievements == null ? [] : user.achievements;

	/*     if (!user || !achi)
		return ; */

		if (!user)
			return ;
		this.notificationRepository.save({
			type: "Achievement",
			body: achievements_list[achiId].description,
			user_to: id,
			message_id: achiId
		});

		if (user.achievements.indexOf(achiId) == -1) {
			user.achievements.push(achiId);
		}
		return this.usersRepository.save(user);
	}

	// achievements id list: 
	// 1 FIRST WIN
	// 2 FIFTH WIN 
	// 3 MATCH PLAYED
	// 4 THREE MATCH PLAYED

	async addNewGame(gameDto: GameDto) {
		// gameDto.final_score = sanitizeHtml(gameDto.final_score);
		// gameDto.loser_id = parseInt(sanitizeHtml(gameDto.loser_id.toString()));
		// gameDto.winner_id = parseInt(sanitizeHtml(gameDto.winner_id.toString()));
		// gameDto.user_1_id = parseInt(sanitizeHtml(gameDto.user_1_id.toString()));
		// gameDto.user_2_id = parseInt(sanitizeHtml(gameDto.user_2_id.toString()));

		const winner = await this.usersRepository.findOne(gameDto.winner_id); 
		const loser = await this.usersRepository.findOne(gameDto.loser_id); 
		const winner_num_of_games = await this.getNumOfGamePlayed(winner.id);
		const loser_num_of_games = await this.getNumOfGamePlayed(loser.id);

		if (!winner || !loser) {
			return ;
		}

		if (winner_num_of_games == 0) {
			this.addAchievement(winner.id, 3);
		}
		else if (winner_num_of_games == 2) {
			this.addAchievement(winner.id, 4);
		}
		if (loser_num_of_games == 0) {
			this.addAchievement(loser.id, 3);
		}
		else if (winner_num_of_games == 2) {
			this.addAchievement(loser.id, 4);
		}
		this.addWin(gameDto.winner_id);
		return this.gameRepository.save(gameDto);
	}

	async addWin(user_id) {
		user_id = parseInt(sanitizeHtml(user_id.toString()));
		const user = await this.usersRepository.findOne(user_id);
		if (!user)
			return ;
		if (user.num_wins == 0) {
			this.addAchievement(user.id, 1);
		}
		else if (user.num_wins == 4) {
			this.addAchievement(user.id, 2);
		}
		// let user_wins = 0;
		// if (user.num_wins == 0) {
		// 	user_wins = 1;
		// } else {
		// 	user_wins = user.num_wins + 1;
		// }
		user.num_wins = user.num_wins + 1;
		// return this.usersRepository.update(user_id, {num_wins: user_wins});
		return this.usersRepository.save(user);
	}

	async updateStatus(id, status: string) {
		id = parseInt(sanitizeHtml(id.toString()));
		status = sanitizeHtml(status);
		const user = await this.usersRepository.findOne(id);
		if (!user)
			return ;
		return this.usersRepository.update(id, {status: status});
	}


	async storeMessage(message: Message) {
		let user = await this.findOne(message.room)
		if (user == null)
		return
	}

	getLadder() {
		
		return this.usersRepository.find({
		order: {
			num_wins: "DESC"
		},
		take: 10,
		});
	}

	async getLiveGames() {
		const games = await this.liveGameRepository.find();
		return this.liveGameRepository.find();
	}

	async getSingleLiveGame(game_id: string) {
		game_id = sanitizeHtml(game_id);
		return this.liveGameRepository.find({
			where: [
				{ game_id: game_id }
			]
		});
	}


	async createLiveGame(player_1_username, player_2_username, game_unique_id: string) {
		game_unique_id = sanitizeHtml(game_unique_id);
		if (!player_1_username || !player_2_username)
		return 'invalid';

		this.liveGameRepository.save({
			user_1_id: player_1_username.id,
			user_2_id: player_2_username.id,
			game_id: game_unique_id
		})
	}


	async deleteLiveGame(game_unique_id: string) {
		game_unique_id = sanitizeHtml(game_unique_id);
		return this.liveGameRepository.delete({game_id: game_unique_id});
	}

}
