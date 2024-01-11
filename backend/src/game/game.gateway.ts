import { Logger, UseGuards, Request, Res } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { join } from 'path/posix';
import { GameService } from './game.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from "@nestjs/config";

const config = new ConfigService();

// @WebSocketGateway({
//   cors: {
//     origin: true,
//   },
// })
@WebSocketGateway({ cors: config.get<string>("CORS_URL") })
export class GameGateway {
	@WebSocketServer() server: Server;

	constructor(private readonly gameService: GameService, private readonly userService: UsersService) {}

	handleConnection(client: Socket) {
	let service: JwtService;
	//  console.log('client cookie', client.handshake.headers.cookie);
	// const token = client.handshake.headers.cookie;

	//   console.log(this.getUserFromToken(token));

	}



	handleDisconnect(client: Socket) {
		this.gameService.handleDisconnection(client);
		console.log(`client disconnected ${client.id}`);
	}

	@SubscribeMessage('request-private-game')
	async createPrivateSession(@ConnectedSocket() client: Socket, @MessageBody() opponent: any) {
		const id = await this.gameService.createPrivateSession(client, opponent);
		client.emit('private-session-id', id);
	}

	@SubscribeMessage('join-private-game')
	joinPrivateSession(@ConnectedSocket() client: Socket, @MessageBody() sessionId: any) {
		const joined = this.gameService.joinPrivateSession(client, sessionId);

		if (!this.server.sockets.adapter.rooms.get(sessionId)) {
			client.emit('session-not-found');
			return 'failed';
		}
		const clients = this.server.sockets.adapter.rooms.get(sessionId);
		if (this.server.sockets.adapter.rooms.get(sessionId).size > 1) {
		// 1 client is client passed in this function
		// 2 client we need to retrieve from the room
			let clients_to_insert = [];
			for (const clientId of clients) {
				//this is the socket of each client in the room.
				const clientSocket = this.server.sockets.sockets.get(clientId);
				clients_to_insert.push(clientSocket);
			}
			this.gameService.createPrivateGame(clients_to_insert[0], clients_to_insert[1]);
		}
	}

	@SubscribeMessage('end-game')
	endGame(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		this.gameService.signalEndGame(client, data);
	}

	@SubscribeMessage('test-emission')
	create(@ConnectedSocket() client: Socket) { 
		client.emit('test-back'); 
	}

	@SubscribeMessage('request-game')
	addToQue(@ConnectedSocket() client: Socket) {
		this.gameService.addWaitingPlayer(client); 
	}

	@SubscribeMessage('update-player-pos-up')
	updatePlayerPosUp(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		//   console.log(data); // data[0] is keycode and data[1] is id
		this.gameService.updatePlayerPosUp(client, data[0], data[1]);
	}

	@SubscribeMessage('update-player-pos-down')
	updatePlayerPosDown(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		//   console.log(data); // data[0] is keycode and data[1] is id
		this.gameService.updatePlayerPosDown(client, data[0], data[1]);
	}

	@SubscribeMessage('update-ball-pos')
	updateBallPos(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		//   console.log(data);
		this.gameService.updateBallPos(client, data);  
	}

	@SubscribeMessage('update-player-pos')
	updatePlayerPos(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		//   console.log(data);
		this.gameService.updatePlayerPos(client, data);  
	}

	@SubscribeMessage('request-game-watch')
	requestGameWatch (@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		this.gameService.requestGameWatch(client, data);
	}
}
