<script>
import { defineComponent, reactive } from "vue";
import {createApp} from 'vue';
import PrimeVue from 'primevue/config';
import {PrimeIcons} from 'primevue/api';
import InputSwitch from 'primevue/inputswitch';
import InputMask from 'primevue/inputmask';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import axios from 'axios';
import SpeedDial from 'primevue/speeddial';
import io from 'socket.io-client';
import router from '@/router';
import ProgressSpinner from 'primevue/progressspinner';

export default{
	data() {
		return {
			items_ball: [
                {
                    label: 'Retro',
                    icon: 'fas fa-square',
                    command: () => {
                        this.$toast.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
						this.mode = 1;
                    }
                },
                {
                    label: 'Classic',
                    icon: 'fas fa-circle',
                    command: () => {
                        this.$toast.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
						this.mode = 2;
                    }
                },
				{
                    label: 'Special',
                    icon: 'fas fa-basketball-ball',
                    command: () => {
						this.mode = 3;
                        this.$toast.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
                    }
                },
			],
			items_field: [
				{
					label: 'Retro',
					icon: 'fas fa-camera-retro',
					command: () => {
						this.mode = 1;
					}
				},
				{
					label: 'Classic',
					icon: 'fas fa-gamepad',
					command: () => {
						this.mode = 2;
					}
				},
				{
					label: 'Special',
					icon: 'fas fa-rocket',
					command: () => {
						this.mode = 3;
					}
				}
			],
			socket: {},
			privateMode: false,
			userAvatar: '',
			userAvatarDiv: '',
			playBtn: true,
			playerImages: false,
			progressBar: false,
			progressStyle: "width: 50%;",
			gameReady: false,
			waitingText: 'Searching for an opponent...',
			opponentUsername: 'TEst',
			countdown: '',
			context: {},
			mode: 1,
			game_id: '',
			whichPlayer: '',
			canvas_width: 750,
			canvas_height: 565,
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
			other_user: {},
			sessionId: '',
			gameOver: false,
			winnerAvatar: null,
			session_not_found: false,
		}
	},
	methods: {
		async get_image()
		{
			const api = this.$base_url + 'users/me';
			const result = await this.axios.get(api, { withCredentials: true });
			this.userAvatar = result.data.avatar;
			// this.userAvatarDiv = `<img src="${this.userAvatar}" class="profile-pic">`
		},
		playBtnClick () {
			this.playBtn = false;
			this.progressBar = true;
			this.requestGame();
		},
		requestGame() {
			this.socket.emit('request-game');
		},
		updatePlayerPos() {
			this.socket.emit('update-player-pos', this.game_id);
		},
		drawBg() {
			this.context.clearRect(0, 0, this.canvas_width,this.canvas_height);
			if (this.mode == 3) // special 
			{
				this.gkArea();
				this.context.fillStyle = 'lightgreen';
			}
			else if (this.mode == 2) { // retro mode 
				this.context.fillStyle = '#2693f3';
			}
			else if (this.mode == 1) { // classic mode
				this.context.fillStyle = 'black';
			}
			this.context.fillRect(0, 0, this.canvas_width, this.canvas_height);
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
			// requestAnimationFrame(this.loop);



			this.drawBg();

			this.context.fillStyle = 'white';
			// this.context.fillRect(this.left_paddle.x, this.left_paddle.y, this.left_paddle.width, this.left_paddle.height);
			// this.context.fillRect(this.right_paddle.x, this.right_paddle.y, this.right_paddle.width, this.right_paddle.height);

			this.drawBall();

			// this.left_paddle.y += this.left_paddle.dy; 
			// this.right_paddle.y += this.right_paddle.dy;

			// // DRAW PADDLES // // 
			if (this.mode == 3)// special 
			{
				this.drawCenterBoard();
				this.gkArea();

				var img = new Image();
				// img.src = "https://cdn.intra.42.fr/users/stribuzi.jpg";
				img.src = this.$base_url + "special-paddle.jpg";
				
				this.context.drawImage(img, this.left_paddle.x, this.left_paddle.y, 15, 80);
				this.context.drawImage(img, this.right_paddle.x, this.right_paddle.y, 15, 80);
				
			}
			else if (this.mode == 1 || this.mode == 2) { // classic and retro have the same paddles
				this.context.fillStyle = 'white';
				this.context.fillRect(this.left_paddle.x, this.left_paddle.y, this.left_paddle.width, this.left_paddle.height);
				this.context.fillRect(this.right_paddle.x, this.right_paddle.y, this.right_paddle.width, this.right_paddle.height);
			}
			this.drawWalls();

			// center vertical line 
			if (this.mode == 3) { //special
				this.context.strokeStyle = 'white';
				this.context.beginPath();
				this.context.lineWidth = 3;
				this.context.moveTo(this.canvas_width / 2, 0);
				this.context.lineTo(this.canvas_width / 2, this.canvas_height);
				this.context.stroke();
			}

			// draw dotted line down the middle
			if (this.mode == 1) { // only in retro mode
				for (let i = this.grid; i < this.canvas_height - this.grid; i += this.grid * 2) {
					this.context.fillRect(this.canvas_width / 2 - this.grid / 2, i, this.grid, this.grid);
				}
			}
			
			// drawBall();
			// }
		},
		drawBall() {
			if (this.mode == 3) // special
			{
				var img = new Image();
				// img.src = '../assets/images/gk.png';
				img.src = "https://cdn.intra.42.fr/users/stribuzi.jpg";
				
				this.context.drawImage(img, this.ball_position.x, this.ball_position.y, 20, 20);
			}
			else if (this.mode == 1)
				this.context.fillRect(this.ball_position.x, this.ball_position.y, 15, 15);
			else {
				this.context.beginPath();
				this.context.arc(this.ball_position.x, this.ball_position.y, 10, 0, 2 * Math.PI);
				this.context.fill();
			}
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
		reset() {
			this.playBtn = true;
			this.playerImages = false;
			this.progressBar = false;
			this.gameReady = false;
			this.waitingText = 'Searching for an opponent...';
			this.opponentUsername = '';
			this.countdown = '';
			this.mode = 1;
			this.game_id = '';
			this.whichPlayer = '';
			this.rightScore = 0;
			this.leftScore = 0;
			this.ball_position.x = 780 / 2;
			this.ball_position.y =  585 / 2;
			this.progressStyle = "width: 50%";
			this.gameOver = false;
			this.privateMode = false;
		},
		async getOpponentInfos() {
			const api = this.$base_url + "users/findbyuser/" + this.opponentUsername;
			const res = await this.axios.get(api, {withCredentials: true});
			this.other_user = res.data[0];
		},
		joinPrivateGame() {
			this.socket.emit('join-private-game', this.sessionId);
		}
	},
	beforeRouteLeave (to, from) {
		this.socket.disconnect();
		return true;
	},
	mounted() {
		this.context = this.$refs.game.getContext('2d');

		window.addEventListener('keydown', (e) => {
				this.socket.emit('update-player-pos-up', e.keyCode, this.game_id);
		})
		window.addEventListener('keyup', (e) => {
				this.socket.emit('update-player-pos-down', e.keyCode, this.game_id);
		})

		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const id = urlParams.get('id');
		
		if (id) { //specific match
			this.sessionId = id;
			this.privateMode = true;
			this.joinPrivateGame();
		}
	},
	created() {
		this.get_image();
		this.socket = io(this.$base_url, {
			withCredentials: true
		});

		this.socket.on('game-on', (data) => {
			this.progressStyle = "width: 100%";
			this.waitingText = 'Opponent found!';
			this.playBtn = false;
			this.privateMode = false;
			setTimeout(() => {
				this.progressBar = false;
				this.playerImages = true;
				setTimeout(() => {
					this.playerImages = false;
					this.gameReady = true;
				}, 3000);
			}, 1000);
			setInterval(this.loop, 10);

		})
		this.socket.on('opponent-username', (username) => {
			this.opponentUsername = username;
			this.getOpponentInfos();
		})
		this.socket.on('countdown', (countdown) => {
			this.countdown = countdown;
			if (this.countdown == 0)
				this.countdown = null;
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
			this.reset();
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
				// alert('Congrats! You won!');
				this.winnerAvatar = this.userAvatar;
			}
			else if (data == 'right' && this.whichPlayer == 'RIGHT') {
				// alert('Congrats! You won!');
				this.winnerAvatar = this.userAvatar;
			}
			else {
				// alert('Bad, you lost :(');
				this.winnerAvatar = this.other_user.avatar;
			}
			this.gameOver = true;
			this.socket.emit('end-game', this.game_id);
			setTimeout(this.reset, 5000);
		})

		this.socket.on('session-not-found', () => {
			this.session_not_found = true;
		})
	}
}

</script>

<template>
<div>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">  
	<!-- https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css -->         
	<div class="grid grid-nogutter flex align-items-center justify-content-center" style="height: 90vh" v-if="playBtn && !privateMode">
		<div class="sm:col-12 md:col-6 lg:col-4" >
			<div class="flex align-items-stretch justify-content-center flex-wrap card-container">
				<Button label="Play" style="font-size: 1.2 rem;" class="align-self-center flex align-items-center justify-content-center p-button-raised p-button-danger play-btn" @click="playBtnClick">
				</Button>
			</div>
		</div>
	</div>
<div class="grid grid-nogutter flex align-items-center justify-content-center" style="height: 90vh" v-if="privateMode && !session_not_found">
	<div class="sm:col-12 md:col-12 lg:col-12" >
		<div class="flex align-items-stretch justify-content-center flex-wrap card-container">
			<ProgressSpinner />
		</div>
	</div>
	<div class="sm:col-12 md:col-12 lg:col-12" style="margin-top: -550px;">
		<div class="flex align-items-stretch justify-content-center flex-wrap card-container">
			<p style="color: white; font-size: 16px;">Waiting for the other player to join...</p>
		</div>
	</div>
</div>
<div class="grid grid-nogutter flex align-items-center justify-content-center" style="height: 90vh" v-if="privateMode && session_not_found">
	<div class="sm:col-12 md:col-12 lg:col-12" style="margin-top: -550px;">
		<div class="flex align-items-stretch justify-content-center flex-wrap card-container">
			<p style="color: white; font-size: 16px;">Session not found or expired!</p>
		</div>
	</div>
</div>
	<!-- <div class="grid grid-nogutter flex align-items-center justify-content-center">
		<div class="sm:col-12 md:col-6 lg:col-4" >
			<div class="flex align-items-stretch justify-content-center flex-wrap card-container">
				<input type="text" placeholder="enter id" v-model="sessionId"/> 
				<Button label="Join Session" style="font-size: 1.2 rem;" class="align-self-center flex align-items-center justify-content-center p-button-raised p-button-danger play-btn" @click="joinPrivateGame">
				</Button>
			</div>
		</div>
	</div> -->
	<div class="grid grid-nogutter align-content-center flex justify-content-center" style="height: 80vh" v-if="progressBar">
		<div class="align-content-center justify-content-center">
			<div class="progress-bar">
				<span class="progress-bar__fill" v-bind:style="progressStyle"></span>
			</div>
			<p style="text-align: center; margin-top: 20px; color: white; font-size: 20px;">{{waitingText}}</p>
		</div>
	</div>
	<div class="grid flex align-content-center justify-content-center card-container" v-if="playerImages" style="height: 80vh;">
		<div class="fadeinleft animation-duration-1000 animation-iteration-one lg:col-4 md:col-4 sm:col-12 flex align-items-center justify-content-end">
			<!-- <div class="image-cropper">
				<img v-bind:src="userAvatar" style="" class="profile-pic">
			</div> -->
			<Avatar v-bind:image="userAvatar" shape="circle" size="xlarge" />
		</div>
		<div class="scalein animation-duration-1000 animation-iteration-one lg:col-4 md:col-4 sm:col-12 flex align-items-center justify-content-center">
			<p style="font-family: 'Bangers', cursive; text-align: center; font-size: 7rem; color:white;">versus</p>	
		</div>
		<div class="fadeinright animation-duration-1000 animation-iteration-one lg:col-4 md:col-4 sm:col-12 flex align-items-center justify-content-start">
			<!-- <div class="image-cropper">
				<img src="https://res.cloudinary.com/muhammederdem/image/upload/v1537638518/Ba%C5%9Fl%C4%B1ks%C4%B1z-1.jpg" style="" class="profile-pic">
			</div> -->
			<Avatar v-bind:image="this.other_user.avatar" shape="circle" size="xlarge" />
		</div>
	</div>
	<!-- <div class="game-div" v-if="gameReady"> -->
		<div class="" style="text-align: center;" v-show="gameReady">
			<canvas ref="game" style="border: 1px solid red;" class="game" width="750" height="565"  id="game"></canvas>
		</div>
		<div class="overlay" style="width: 100%; heigth:100%; margin: 0; background-color: black;" v-show="countdown > 0 && gameReady">
		</div>
		<div class="countdown" style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);" v-show="countdown > 0 && gameReady">
			<p style="color: white; font-size: 80px;">{{countdown}}</p>
		</div>
		<!-- <div> {{ game_id }} </div> -->
		<SpeedDial :model="items_field" direction="up" class="speeddial-right" buttonClass="p-button-danger" :tooltipOptions="{position: 'left'}" showIcon="fas fa-edit" v-if="gameReady" />
		<SpeedDial :model="items_ball" direction="up" class="speeddial-left" buttonClass="p-button-help" :tooltipOptions="{position: 'right'}" showIcon="fas fa-baseball" v-if="gameReady" />
	<!-- </div> -->

	<div class="fadein animation-duration-1000 animation-iteration-one overlay-100" v-if="gameOver">
		<div class="end-game">
			<Avatar v-bind:image="this.winnerAvatar" shape="circle" size="xlarge" />
			<p style="font-family: 'Bangers', cursive; text-align: center; font-size: 7rem; color:white;">Winner</p>
			<Button class="button-minimal" label="Exit" style="font-size: 1.2 rem;" @click="gameOver = false;">
			</Button>
		</div>
	</div>
</div>
</template>

<style lang="scss">

@import url('https://fonts.googleapis.com/css2?family=Bangers&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
.speeddial-right {
	position: absolute;
	right: 20%;
}


.speeddial-left {
	position: absolute;
	left: 20%;
}

.game {
	width: 780px;
	height: 585px;
}

@media(max-width: 767px) {
	.game {
		width: 90vw;
		height: 50vh;
	}
}

.overlay {
	position: absolute;
	top: 0;
	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.277);
	opacity: 0.5;
}

.play-btn {
 	display: inline-block;
	background-color: #FF4571;
	border: 4px solid #fff;
	border-radius: 100px;
	color: #fff;
	width: 200px;
	height: 56px;
	font-size: 42px;
	text-align: center;
	font-weight: 900;
	letter-spacing: -3px;
	line-height: 56px;
	text-decoration: none;
	&:hover {
		background-color: lighten(#FF4571, 5%);
	}
}

.image-cropper {
    width: 200px;
    height: 200px;
    position: relative;
    overflow: hidden;
    border-radius: 50%;
	border: 3px solid rgb(238, 0, 83);
}

.profile-pic {
  display: inline;
  margin: 0 auto;
  margin-left: -25%; //centers the image
  height: 100%;
  width: auto;

}

.progress-bar {
  width: 300px;
  background-color: rgba(0,0,0,0.1);
  height: 4rem;
  border-radius: 5rem;
  overflow: hidden;
 //  position: relative;
  box-shadow: 0 0 0 0.25rem rgba(255,255,255,0.8), 0 2.8rem 1rem -2rem rgba(0,0,0,0.15);
}


.progress-bar__fill {
  display: block;
  height: 100%;
  background-color: red;
  // background-image: linear-gradient(180deg, rgba(255,143,184,1) 0%, rgba(255,97,155,1) 25%, rgba(255,97,155,1) 75%, rgba(255,67,136,1) 100%);
  background-image: linear-gradient(180deg, red 0%, rgb(255, 132, 132) 100%);
  animation: fill 6s;
}

.progress-bar__fill:after {
  content: '';
  display: flex;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-image: linear-gradient( -45deg, rgba(255, 255, 255, .2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .2) 50%, rgba(255, 255, 255, .2) 75%, transparent 75%, transparent );
  background-size: 6rem 6rem;
  animation: loading-fill 3s linear infinite;
}

.fill-25 {
	width: 25%;
}

.fill-50 {
	width: 50%;
}

.fill-75 {
	width: 75%;
}

.fill-100 {
	width: 100%;
}

@keyframes fill {
  0% {
    width: 0;
  }
}

@keyframes loading-fill {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 6rem 6rem;
  }
}

.p-avatar-image {
	width: 10rem !important;
	height: 10rem !important;
}

.end-game {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 3;
	text-align: center;
}

.overlay-100 {
	position: absolute;
	top: 0;
	width: 100vw;
	height: 100vh;
	background-color: rgb(0, 0, 0);
	opacity: 1;
}

.button-minimal {
	background: transparent;
	color: white;
	border: 1px solid white;
	width: 150px;
}

</style>
