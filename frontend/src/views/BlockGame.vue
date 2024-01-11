<script>

import io from 'socket.io-client'

import SocketioService from '../service/socketio.service';



export default {
	data() {
		return {
			opponent_username: '',
			countdown: '',
			socket: {},
			context: {},
			mode: 1,
			canvas_width: 750,
			canvas_height: 585,
			paddleHeight: 80,
			grid : 15,
			ballSpeed: 3,
			rightScore: 0,
			leftScore: 0,
			left_paddle: {
				x: 30,
				y: 585 / 2 - 80 / 2,
				width: 15,
				height: 80,
				dy: 0 // paddle speed
			},
			right_paddle: {
				x: 750 - 15 * 3,
				y: 585 / 2 - 80 / 2,
				width: 15,
				height: 80,
				dy: 0 // paddle speed
			},
			ball_position: {
				// start in the middle of the game
				x: 780 / 2,
				y: 585 / 2,
				width: 35 - 5,
				height: 15,
				// keep track of when need to reset the ball position
				resetting: false,
				// ball velocity (start going to the top-right corner)
				dx: 3,
				dy: -3
			},
			game_id: '',
			whichPlayer: '',
			sessionId: '',
		}
	},
	methods: {
		requestGame() {
			this.socket.emit('request-game');
		},
		updateBallPos() {
			// this.socket.emit('update-ball-pos', this.game_id);
			// this.updatePlayerPos();
		},
		updatePlayerPos() {
			this.socket.emit('update-player-pos', this.game_id);
		},
		collides(obj1, obj2) {
			return obj1.x < obj2.x + obj2.width &&
					obj1.x + obj1.width > obj2.x &&
					obj1.y < obj2.y + obj2.height &&
					obj1.y + obj1.height > obj2.y;
		},
		drawBg() {
			if (this.mode == 0)
			{
				this.context.fillStyle = 'lightgreen';
				this.context.clearRect(0, 0, this.canvas_width,this.canvas_height);
				this.context.fillRect(0, 0, this.canvas_width, this.canvas_height);
				this.gkArea();
			}
			else if (this.mode == 1) {
				this.context.fillStyle = '#2693f3';
				this.context.clearRect(0, 0, this.canvas_width,this.canvas_height);
				this.context.fillRect(0, 0, this.canvas_width, this.canvas_height);
			}
			else if (this.mode == 2) {
				this.context.fillStyle = 'black';
				this.context.clearRect(0, 0, this.canvas_width,this.canvas_height);
				this.context.fillRect(0, 0, this.canvas_width, this.canvas_height);
			}
			this.context.font = "50px Arial";
			this.context.fillStyle = "white";
			this.context.fillText(this.leftScore, 50, 100);
			this.context.fillText(this.rightScore, this.canvas_width - 100, 100);

			this.context.font = "30px Arial";
			this.context.fillStyle = "white";
			if (this.whichPlayer == 'LEFT') {
				this.context.fillText(this.whichPlayer, this.canvas_width / 2 - 140, 40);
			}
			else {
				this.context.fillText(this.whichPlayer, this.canvas_width / 2 + 60, 40);
			}
			
			this.context.font = "70px 'Press Start 2P'";
			this.context.fillStyle = "white";
			this.context.fillText('PONG', this.canvas_width / 2 - 140 , this.canvas_height / 2 + 35);


		},
		loop() {
			this.updateBallPos();
			// requestAnimationFrame(this.loop);



			this.drawBg();

			this.context.fillStyle = 'white';
			// this.context.fillRect(this.left_paddle.x, this.left_paddle.y, this.left_paddle.width, this.left_paddle.height);
			// this.context.fillRect(this.right_paddle.x, this.right_paddle.y, this.right_paddle.width, this.right_paddle.height);

			this.drawBall();

			// this.left_paddle.y += this.left_paddle.dy; 
			// this.right_paddle.y += this.right_paddle.dy;

			// // draw paddles
			// context.fillStyle = 'white';
			// // context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
			// // context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
			if (this.mode == 0)
			{
				var img = new Image();
				// img.src = '../assets/images/gk.png';
				img.src = "https://cdn.intra.42.fr/users/stribuzi.jpg";
				
				this.context.drawImage(img, this.left_paddle.x, this.left_paddle.y, 60, 60);
				this.context.drawImage(img, this.right_paddle.x, this.right_paddle.y, 60, 60);
				
				this.drawCenterBoard();
			}
			else if (this.mode == 1 || this.mode == 2) {
				this.context.fillStyle = 'white';
				this.context.fillRect(this.left_paddle.x, this.left_paddle.y, this.left_paddle.width, this.left_paddle.height);
				this.context.fillRect(this.right_paddle.x, this.right_paddle.y, this.right_paddle.width, this.right_paddle.height);
			}
			this.drawWalls();

			// center vertical line 
			if (this.mode == 0) {
				this.context.strokeStyle = 'white';
				this.context.beginPath();
				this.context.lineWidth = 3;
				this.context.moveTo(this.canvas_width / 2, 0);
				this.context.lineTo(this.canvas_width / 2, this.canvas_height);
				this.context.stroke();
			}

			// draw dotted line down the middle
			if (this.mode == 2) {
				for (let i = this.grid; i < this.canvas_height - this.grid; i += this.grid * 2) {
					this.context.fillRect(this.canvas_width / 2 - this.grid / 2, i, this.grid, this.grid);
				}
			}
			
			// drawBall();
			// }
		},
		drawBall() {
			if (this.mode == 0)
			{
				var img = new Image();
				// img.src = '../assets/images/gk.png';
				img.src = "https://cdn.intra.42.fr/users/stribuzi.jpg";
				
				this.context.drawImage(img, this.ball_position.x, this.ball_position.y, 20, 20);
			}
			else
				this.context.fillRect(this.ball_position.x, this.ball_position.y, 15, 15);
		},
		changeMode(mode) {
			this.mode = mode;
			this.drawBg();
		},
		drawWalls() {
			// draw walls
			this.context.fillStyle = 'white';
			this.context.fillRect(0, 0, this.canvas_width, this.grid);
			this.context.fillRect(0, this.canvas_height - this.grid, this.canvas_width, this.grid);
		},
		drawCenterBoard() {
			  // bigger circle
			this.context.beginPath();
			this.context.arc(this.canvas_width / 2, this.canvas_height / 2, this.canvas_width / 8, 0, 2 * Math.PI, false);
			this.context.lineWidth = 3;
			this.context.strokeStyle = 'white';
			this.context.stroke();

			// inner circle
			this.context.beginPath();
			this.context.arc(this.canvas_width / 2, this.canvas_height / 2, 6, 0, 2 * Math.PI, false);
			this.context.lineWidth = 3;
			this.context.fillStyle = 'white';
			this.context.fill();
		},
		gkArea() {
			// left area
			// big rect
			this.context.beginPath();
			this.context.lineWidth = "3";
			this.context.strokeStyle = "white";
			this.context.rect(-1, this.canvas_height / 3, 100, this.canvas_height / 3);
			this.context.stroke();
			// small rect
			this.context.beginPath();
			this.context.lineWidth = "3";
			this.context.strokeStyle = "white";
			this.context.rect(-1, this.canvas_height / 3 + 30, 50, this.canvas_height / 3 - 60);
			this.context.stroke();
			// half circle
			this.context.beginPath();
			this.context.lineWidth = "3";
			this.context.strokeStyle = "white";
			this.context.arc(100, this.canvas_height / 2, 40, 3 * Math.PI / 2, Math.PI / 2);
			this.context.stroke();

			this.context.beginPath();
			this.context.fillStyle = 'white';
			this.context.arc(80, this.canvas_height / 2, 2, 0, 2 * Math.PI);
			this.context.fill();

			// right area
			// big rect
			this.context.beginPath();
			this.context.lineWidth = "3";
			this.context.strokeStyle = "white";
			this.context.rect(this.canvas_width - 100, this.canvas_height / 3, this.canvas_width - 100, this.canvas_height / 3);
			this.context.stroke();
			// small rect
			this.context.beginPath();
			this.context.lineWidth = "3";
			this.context.strokeStyle = "white";
			this.context.rect(this.canvas_width - 50, this.canvas_height / 3 + 30, 50, this.canvas_height / 3 - 60);
			this.context.stroke();
			// half circle
			this.context.beginPath();
			this.context.lineWidth = "3";
			this.context.strokeStyle = "white";
			this.context.arc(this.canvas_width - 100, this.canvas_height / 2, 40, Math.PI / 2, 3 * Math.PI / 2);
			this.context.stroke();

			this.context.beginPath();
			this.context.fillStyle = 'white';
			this.context.arc(this.canvas_width - 80, this.canvas_height / 2, 2, 0, 2 * Math.PI);
			this.context.fill();
		},
		requestPrivateGame() {
			this.socket.emit('request-private-game', 'stribuzi');
		},
		joinPrivateGame() {
			this.socket.emit('join-private-game', this.sessionId);
		}
	},
	created() {
		// this.socket = io('http://localhost:5050', {
		// 	withCredentials: true
		// });


		this.socket = SocketioService.getSocket();
		this.socket.emit('test-emission');
		this.socket.on('private-session-id', (id) => {
			alert(id);
		})
		// this.socket.on('test-back', () => {
		// 	alert('test received!');
		// });
		this.socket.on('game-on', (data) => {
			// alert('opponent found!');
			this.found_text = 'Opponent found!';
			setInterval(this.loop, 10);

		})
		this.socket.on('countdown', (countdown) => {
			this.countdown = countdown;
			if (this.countdown == 0)
				this.countdown = null;
		})
		this.socket.on('opponent-username', (username) => {
			this.opponent_username = username;
		})
		this.socket.on('game-id', (game_id) => {
			this.game_id = game_id;
			this.found_text = game_id;
		})

		this.socket.on('player-left-pos', (y) => {
			this.left_paddle.y = y;
		})
		this.socket.on('player-right-pos', (y) => {
			this.right_paddle.y = y;
		})

		this.socket.on('player-right-dy', (dy) => {
			this.right_paddle.dy = dy;
		})

		this.socket.on('player-left-dy', (dy) => {
			this.left_paddle.dy = dy;
		})

		this.socket.on('ball-pos', (x, y) => {
			this.ball_position.x = x;
			this.ball_position.y = y;
		})
		this.socket.on('game-over-disconnection', () => {
			alert('the other player has disconnected!');
		})
		this.socket.on('score', (left, right) => {
			this.rightScore = right;
			this.leftScore = left;
		})
		this.socket.on('left-player', () => {
			this.whichPlayer = 'LEFT';
		});
		this.socket.on('right-player', () => {
			this.whichPlayer = 'RIGHT';
		})
		this.socket.on('winner', (data) => {
			if (data == 'left' && this.whichPlayer == 'LEFT') {
				alert('Congrats! You won!');
			}
			else if (data == 'right' && this.whichPlayer == 'RIGHT') {
				alert('Congrats! You won!');
			}
			else {
				alert('Bad, you lost :(');
			}
			this.socket.emit('end-game', this.game_id);
		})
	},
	mounted() {
		this.context = this.$refs.game.getContext('2d');

		window.addEventListener('keydown', (e) => {
				this.socket.emit('update-player-pos-up', e.keyCode, this.game_id);
		})
		window.addEventListener('keyup', (e) => {
				this.socket.emit('update-player-pos-down', e.keyCode, this.game_id);
		})
		
	}
}


</script>


<template>

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
</head>
<body id="body">

	<div id="text-div">
        <button @click="requestGame" style="font-family: 'Press Start 2P';">request GAME</button>
        <p id="main-text" style="color: red;"></p>
    </div>

	<button @click="requestPrivateGame">PRIVATE GAME</button>
	<input type="text" placeholder="enter id" v-model="sessionId"/> 
	<button @click="joinPrivateGame">JOIN PRIVATE</button>

	<div class="countdown">
		<p>{{countdown}}</p>
	</div>

    
    
    <div id="main-game">
        <canvas ref="game" id="game" width="750" height="565" style="border: 1px solid red;"></canvas>
	</div>
    <div style="padding-left: 50px;">
		{{ this.game_id }}
		{{ this.opponent_username }}
       <div class="classic" @click="changeMode(0)"></div>
       <div class="football" @click="changeMode(1)"></div>
       <div class="retro" @click="changeMode(2)"></div>

    </div>
	
</body>
</html>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

	.countdown {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.countdown p {
		font-size: 7rem;
	}

	.classic {
		height: 20px;
		width: 20px;
		background-color: brown;
	}
	.football {
		margin-top: 10px;
		height: 20px;
		width: 20px;
		background-color: green;
	}
	.retro {
		margin-top: 10px;
		height: 20px;
		width: 20px;
		background-color: palegoldenrod;
	}

	html, body {
		height: 100% !important;
		margin: 0 !important;
	}

	#body {
		/* background: black; */
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>