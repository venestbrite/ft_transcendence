import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';

class singleGame {
	private _player_1: Socket;
	private _player_2: Socket;
	private _player_1_username: string;
	private _player_2_username: string;
	private _winner: number;
	private _spectators: Socket[] = [];
	private _grid: number = 15;
	private _paddle_speed: number = 5;
	private _ball_speed: number = 2;
	private _max_paddle_y = 585 - 30 - 80; // canvas height - grid - paddle height 
	private _end_registered: boolean = false;
	private canvas = {
		height: 585,
		width: 780
	}
	private _ball = {
		x: 780 / 2,
		y: 585 / 2,
		width: 35 - 5,
		height: 15,
		dx: this._ball_speed,
		dy: this._ball_speed
	};
	private _player_1_pos = {
		x: 30,
		y: 585 / 2 - 80 / 2,
		width: 15,
		height: 80,
		dy: 0
	}
	private _player_2_pos = {
		x: 750 - 15 * 3,
		y: 585 / 2 - 80 / 2,
		width: 15,
		height: 80,
		dy: 0
	}
	private _game_id: string;
	private _left_score: number = 0;
	private _right_score: number = 0;
	private _final_score: string;
	private _interval_id: any;
	private _max_score: number = 5;
	private _speed_interval;

	constructor(player_1: Socket, player_2: Socket, game_id: string, user_1: string, user_2: string) {
		this._player_1 = player_1;
		this._player_2 = player_2;
		this._game_id = game_id;
		this._player_1_username = user_1;
		this._player_2_username = user_2;
		this.sendToBoth('game-on');
		this._player_1.emit('game-id', this._game_id);
		this._player_1.emit('left-player');
		this._player_1.emit('opponent-username', this._player_2_username);
		this._player_2.emit('game-id', this._game_id);
		this._player_2.emit('right-player');
		this._player_2.emit('opponent-username', this._player_1_username);

		let countdown: number = 8;

		let countInterval = setInterval(() => {
			if (countdown >= 0)
			{
				this.sendDataToBoth('countdown', countdown);
				countdown--;
			}
			else
				this.activateGame(countInterval);
		}, 1000)
		
	}
	
	private activateGame(countInterval) {
		clearInterval(countInterval);
		this._interval_id = setInterval(() => {
			this.updateBallPos();
		}, 10);

		this._speed_interval = setInterval(() => {
			this._ball.dx *= 1.3;
			this._ball.dy *= 1.3;
		}, 4000)
	}

	public sendToBoth(message: string) {
		this._player_1.emit(message);
		this._player_2.emit(message);
		this._spectators.forEach((item, index, arr) => {
			item.emit(message);
		});
	}

	public sendDataToBoth(message: string, data) {
		this._player_1.emit(message, data);
		this._player_2.emit(message, data);
		this._spectators.forEach((item, index, arr) => {
			item.emit(message, data);
		});
	}

	public 	collides(obj1, obj2) {
		return obj1.x < obj2.x + obj2.width &&
				obj1.x + obj1.width > obj2.x &&
				obj1.y < obj2.y + obj2.height &&
				obj1.y + obj1.height > obj2.y;
	}

	public updateScore() {
		clearInterval(this._speed_interval);
		this._ball.dx = 2 * ((this._ball.dx * (-1)) / Math.abs(this._ball.dx)); // reset to intial ball speed
		this._ball.dy = 2 * (this._ball.dy / this._ball.dy);
		if (this._left_score == this._max_score) {
			this._winner = 1;
			this.sendDataToBoth('winner', 'left');
			this.endGame('max-score');
			return ; 
		}
		else if (this._right_score == this._max_score) {
			this._winner = 2;
			this.sendDataToBoth('winner', 'right');
			this.endGame('max-score');
			return ;
		}
		this._player_1.emit('score', this._left_score, this._right_score);
		this._player_2.emit('score', this._left_score, this._right_score);
		this._spectators.forEach((sock, index, arr) => {
			sock.emit('score', this._left_score, this._right_score);
		})

		this._speed_interval = setInterval(() => {
			this._ball.dx *= 1.3;
			this._ball.dy *= 1.3;
		}, 2000)
	}

	public updateBallPos() {
		this._player_1_pos.y += this._player_1_pos.dy;
		this._player_2_pos.y += this._player_2_pos.dy;
		if (this._player_1_pos.y < this._grid)
			this._player_1_pos.y = this._grid;
		else if (this._player_1_pos.y > this._max_paddle_y)
			this._player_1_pos.y = this._max_paddle_y;
		if (this._player_2_pos.y < this._grid)
			this._player_2_pos.y = this._grid;
		else if (this._player_2_pos.y > this._max_paddle_y)
			this._player_2_pos.y = this._max_paddle_y;

		if (this._ball.y < this._grid) {
				this._ball.y = this._grid;
				this._ball.dy *= -1;
		}
		else if (this._ball.y + this._grid > this.canvas.height - this._grid) {
			this._ball.y = this.canvas.height - this._grid * 2;
			this._ball.dy *= -1;
		}
		this._ball.x += this._ball.dx;
		this._ball.y += this._ball.dy;
		if (this.collides(this._ball, this._player_1_pos)) {
			this._ball.dx *= -1;
			
			// move ball next to the paddle otherwise the collision will happen again
			// in the next frame
			this._ball.x = this._player_1_pos.x + this._ball.width;
		}
		else if (this.collides(this._ball, this._player_2_pos)) {
			this._ball.dx *= -1;
			
			// move ball next to the paddle otherwise the collision will happen again
			// in the next frame
			this._ball.x = this._player_2_pos.x - this._ball.width;
		}
		if (this._ball.x + this._ball.dx < 0 || this._ball.x + this._ball.dx > 750) { // someone scored 
			if (this._ball.x + this._ball.dx < 0) {
				this._right_score++;
				this.updateScore();
			}
			else if (this._ball.x + this._ball.dx > 750) {
				this._left_score++;
				this.updateScore();
			}
			this._ball.x = 350;
		}
		this.sendBallPos();
	}

	public sendBallPos() {
		this._player_1.emit('ball-pos', this._ball.x, this._ball.y);
		this._player_2.emit('ball-pos', this._ball.x, this._ball.y);
		this._player_1.emit('player-left-pos', this._player_1_pos.y);
		this._player_1.emit('player-right-pos', this._player_2_pos.y);
		this._player_2.emit('player-right-pos', this._player_2_pos.y);
		this._player_2.emit('player-left-pos', this._player_1_pos.y); 

		this._spectators.forEach((sock, index, arr) => {
			sock.emit('ball-pos', this._ball.x, this._ball.y);
			sock.emit('player-left-pos', this._player_1_pos.y);
			sock.emit('player-right-pos', this._player_2_pos.y);
		})

	}

	public movePlayerUp(player: Socket, keycode: number) {
		if (player == this._player_1) {
			switch(keycode) {
				// case 87:
				case 38:
					this._player_1_pos.dy = -this._paddle_speed;
					break ;
				//case 83:
				case 40:
					this._player_1_pos.dy = this._paddle_speed;
				break;
			}
		}
		else if (player == this._player_2) {
			switch(keycode) {
				case 38:
					this._player_2_pos.dy = -this._paddle_speed;
					break ;
				case 40:
					this._player_2_pos.dy = this._paddle_speed;
					break;
			}
		}
	}

	public modePlayerDown(player: Socket, keycode: number) {
		if (player == this._player_1) {
			switch(keycode) {
				// case 87:
				case 38:
					this._player_1_pos.dy = 0;
					break ;
				//case 83:
				case 40:
					this._player_1_pos.dy = 0;
					break;
			}
		}
		else if (player == this._player_2) {
			switch(keycode) {
				case 38:
					this._player_2_pos.dy = 0;
					break ;
				case 40:
					this._player_2_pos.dy = 0;
					break;
			}
		}
	}

	public updatePlayerPos() {
		this._player_1.emit('player-left-pos', this._player_1_pos.y);
		this._player_2.emit('player-left-pos', this._player_1_pos.y);
		this._player_1.emit('player-right-pos', this._player_2_pos.y);
		this._player_2.emit('player-right-pos', this._player_2_pos.y);
	}

	public getId() { return this._game_id; }

	public isPlayerPresent(player: Socket): Boolean {
		if (this._player_1 == player || this._player_2 == player)
			return true;
		return false;
	}

	public endGame(reason: string) {
		// this._player_1.emit('game-over-disconnection');
		// this._player_2.emit('game-over-disconnection');
		this._final_score = this._left_score.toString() + "-" + this._right_score.toString();
		clearInterval(this._interval_id);
		clearInterval(this._speed_interval);
		this.sendToBoth(reason);
	}

	public addSpectator(spectator: Socket) {
		if (this._spectators.indexOf(spectator) == -1)
			this._spectators.push(spectator);
	}

	public getPlayerUsername(id: number) {
		if (id == 1)
			return this._player_1_username;
		return this._player_2_username;
	}

	public getWinner() { return this._winner; }

	public getFinalScore() { return this._final_score; }

	public setRegistered() { this._end_registered = true; }

	public getRegistered() { return this._end_registered; }

}

class singlePrivateGame {
	private _request_id;
	private _player_1_username: string;
	private _player_2;
	private _player_2_username: string;

	constructor(player_1_username: string, player_2_username: string, request_id: string) {
		this._player_1_username = player_1_username;
		this._player_2_username = player_2_username;
		this._request_id = request_id;
	}

	public getId() { return this._request_id; }
}

@Injectable()
export class GameService {

	constructor(private readonly userService: UsersService) {}
	private waiting_players: Socket[] = [];
	private active_games = [];
	private active_requests = [];

	async checkIfGame() {
		if (this.waiting_players.length > 1) {
			const player_1_username = await this.getUserFromSocket(this.waiting_players[0]);
			const player_2_username = await this.getUserFromSocket(this.waiting_players[1]);
			const game_id = this.generateRandomString(10);
			let game = new singleGame(this.waiting_players[0], this.waiting_players[1], game_id, player_1_username.username, player_2_username.username);
			this.userService.updateStatus(player_1_username.id, "gaming");
			this.userService.updateStatus(player_2_username.id, "gaming");
			this.waiting_players.splice(0, 2);
			game.sendToBoth('game-on');
			this.active_games.push(game);
			this.userService.createLiveGame(player_1_username, player_2_username, game_id);
		}
	}
	
	async getUserFromSocket(socket: Socket) {
		const token = socket.handshake.headers.cookie;
		var base64Url = token.split('.')[1];
		var base64 = base64Url.replace('-', '+').replace('_', '/'); // to do, verify token signature 
		const parsed = JSON.parse(atob(base64));
		const user = await this.userService.findById(parsed.id);
		return user;
		// const token = socket.handshake.headers.cookie;
	  }

	handleDisconnection(player: Socket) {
		const index = this.waiting_players.indexOf(player);
		if (index != -1) {
			this.waiting_players.splice(index, 1);
            return ;
		}
        for(let i = 0; i < this.active_games.length; i++) {
            if (this.active_games[i].isPlayerPresent(player) == true) {
				this.active_games[i].endGame('game-over-disconnection');
				this.userService.deleteLiveGame(this.active_games[i].getId());
				this.active_games.splice(i, 1);
				return ;
            }
        }
	}

	async addWaitingPlayer(player: Socket) {
		// const user_to_check = await this.getUserFromSocket(player);
		// for(let i = 0; i < this.waiting_players.length; i++) {
		// 	const user = await this.getUserFromSocket(player);
		// 	console.log(player.disconnected);
		// 	if (user.id == user_to_check.id)
		// 		this.waiting_players.splice(i, 1);
		// }
		if (this.waiting_players.indexOf(player) == -1)
		{
			this.waiting_players.push(player);
			this.checkIfGame();
		}
	}

	updatePlayerPos(player: Socket, id: string) {
		const index = this.active_games.map(obj => obj.getId()).indexOf(id);
		if (index != -1)
			this.active_games[index].updatePlayerPos();

	}

	updatePlayerPosUp(player: Socket, keycode: number, id: string) {
		const index = this.active_games.map(obj => obj.getId()).indexOf(id);
		if (index != -1)
			this.active_games[index].movePlayerUp(player, keycode);

	}

	updatePlayerPosDown(player: Socket, keycode: number, id: string) {
		const index = this.active_games.map(obj => obj.getId()).indexOf(id);
		if (index != -1)
			this.active_games[index].modePlayerDown(player, keycode);
	}

	updateBallPos(player: Socket, id: string) {
		const index = this.active_games.map(obj => obj.getId()).indexOf(id);
		if (index != -1)
			this.active_games[index].updateBallPos();
	}

	async signalEndGame(player: Socket, id: string) {
		const index = this.active_games.map(obj => obj.getId()).indexOf(id);
		if (index != -1) {
			const game = this.active_games[index];
			if (!game.getRegistered()) {
				game.setRegistered();
			} else {
				return ;
			}
			const player_1 = await this.userService.findOne(game.getPlayerUsername(1));
			const player_2 = await this.userService.findOne(game.getPlayerUsername(2));
			if (!player_1 || !player_2)
				return ;
			const winner_num = game.getWinner();
			let winner, loser;
			if (winner_num == 1) {
				winner = player_1;
				loser = player_2;
			}
			else {
				winner = player_2;
				loser = player_1;
			}
			const game_obj = {
				"user_1_id": player_1.id,
				"user_2_id": player_2.id,
				"winner_id": winner.id,
				"loser_id": loser.id,
				"final_score": game.getFinalScore()
			}
			this.userService.addNewGame(game_obj);
			this.userService.deleteLiveGame(game.getId());
			this.active_games.splice(index, 1); // remove specific game from active games

		}
	}

	requestGameWatch(watcher: Socket, game_id: number) {
		const index = this.active_games.map(obj => obj.getId()).indexOf(game_id);
		if (index != -1)
		{
			this.active_games[index].addSpectator(watcher);
			watcher.emit('watcher-accepted');
		}
	}

	generateRandomString(length: number): string {
		let result: string = '';
		const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength: number = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	async createPrivateSession(client: Socket, opponent: string) {
		const user = await this.getUserFromSocket(client);
		const randId = this.generateRandomString(10);
		let request = new singlePrivateGame(user.username, opponent, randId);
		this.active_requests.push(request);
		// client.join(randId);
		return randId;
	}

	async joinPrivateSession(client: Socket, sessionId: string) {
		const index = this.active_requests.map(obj => obj.getId()).indexOf(sessionId);
		if (index != -1) {
			client.join(sessionId); // TODO CHECK THAT CLIENT IS THE USER WE WANT
			return true;
		}
		else {
			return false;
		}
		
	}

	async createPrivateGame(client_1: Socket, client_2: Socket) {
		const player_1_username = await this.getUserFromSocket(client_1);
		const player_2_username = await this.getUserFromSocket(client_2);
		const game_unique_id = this.generateRandomString(10);
		let game = new singleGame(client_1, client_2, game_unique_id, player_1_username.username, player_2_username.username);;
		this.active_games.push(game);
		game.sendToBoth('game-on');
		this.userService.createLiveGame(player_1_username, player_2_username, game_unique_id);
	}

}
