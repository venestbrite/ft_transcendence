<script lang="ts">
import router from '@/router';
import { defineComponent, reactive } from "vue";
import {createApp} from 'vue';
import PrimeVue from 'primevue/config';
import {PrimeIcons} from 'primevue/api';
import 'primeicons/primeicons.css';
import InputSwitch from 'primevue/inputswitch';
import InputMask from 'primevue/inputmask';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import axios from 'axios';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Knob from 'primevue/knob';
import Toolbar from 'primevue/toolbar';
import io from 'socket.io-client';

export default {
    data() {
        return {
			socket: {},
			user: {},
			other_user: {},
			achievements: [],
			gifs: [],
			avatar: '',
			messages_html: '',
			message: '',
			gif_search: '',
			blockMode: false,
			intervalId: null,
			gifMode: false,
			placeholderMsg: 'Enter a message',
        }
    },
    methods: {

		async get_infos() {
			
			const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const username = urlParams.get('username');
            const api = this.$base_url + 'users/me';
            const result = await this.axios.get(api, { withCredentials: true });

            this.user = result.data;
            this.avatar = result.data.avatar;
			this.achievements = result.data.achievements;

			const other_user_res = await this.axios.get(this.$base_url + 'users/findbyuser/' + username, {withCredentials : true});
			this.other_user = other_user_res.data[0];

			let is_blocked = false;
			if (this.other_user.blocked_users.includes(parseInt(this.user.id)))
				is_blocked = true;
			if (this.user.blocked_users.includes(parseInt(this.other_user.id)))
				is_blocked = true;
			//const is_blocked = await this.axios.get(this.$base_url + 'users/is-blocked/' + this.other_user.id, {withCredentials: true});
			if (is_blocked) {
				this.blockMode = true;
				return ;
			}

			this.get_chats();
			this.intervalId = setInterval(this.get_chats, 1000);
		},
        async get_chats()
        {
			const api_messages = this.$base_url + 'messages/singlechat/find?from_id=' + this.user.id + '&to_id=' + this.other_user.id;
			const messages_res = await this.axios.get(api_messages, {withCredentials: true});

			this.messages_html = '';
			for (let i = messages_res.data.length - 1; i >= 0; i--) {
				let color;
				let date_bool = false;
				let date_1, date_2;
				date_1 = new Date(messages_res.data[i].date);
				// console.log(messages_res.data[i].body, i);
				if (i >= 1) {
					date_2 = new Date(messages_res.data[i - 1].date);
					// console.log((date_2 - date_1) / 1000 / 60);
					if (((date_2 - date_1) / 1000 / 60) > (60 * 24)) {
						date_bool = true;
					}
				}
				let hours = date_1.getHours();
				let minutes = date_1.getMinutes();
				if (minutes < 10) {
					minutes = "0" + minutes;
				}
				let hour = hours + ":" + minutes;
				if (messages_res.data[i].user_from == this.user.id)
					color = 'blue';
				else
					color = 'green';
				let date = null;
				if (date_bool) {
					date = this.calc_date(messages_res.data[i - 1].date);
				} 
				if (i == messages_res.data.length - 1) {
					date = this.calc_date(messages_res.data[i].date);
					this.messages_html += `<div class="time" id="date">${date}</div><br>`;
					date_bool = false;
				}
				if (messages_res.data[i].gif) {
					this.messages_html += `<div class="message gif" id="${color}"><img src='${messages_res.data[i].gif_url}' style='height: 200px;'> <small class='hour'>${hour}</small></div></div>` + (color === 'blue' ? '<br><br><br><br><br><br><br><br><br><br><br><br>' : '<br>');
					// this.messages_html += `
					// <div class="message" id="${color}"><img src='${messages_res.data[i].gif_url}' style='width: 200px;'> <small class='hour'>${hour}</small></div>` + (color === 'blue' ? '<br><br><br><br><br><br><br><br><br><br><br><br>' : '') + 
					// `
					// `;
				} else {
					this.messages_html += `
						<div class="message" id="${color}">${messages_res.data[i].body} <small class='hour'>${hour}</small></div>` + (color === 'blue' ? '<br>' : '') + 
						`
					`;
				}
				if (date_bool && date) {
					this.messages_html += `<div class="time" id="date">${date}</div><br>`;
				} else {
					this.messages_html += '<br>';
				}
			}
			if (messages_res.data.length > 0) {
				if (messages_res.data[0].user_from == this.user.id && messages_res.data[0].read == true) {
					this.messages_html += `<div class="read" id="blue" >✓✓ Read</div><br>`
				} else if (messages_res.data[0].user_from == this.user.id && messages_res.data[0].read == false) {
					this.messages_html += `<div class="read" >✓ Delivered</div><br>`
				}
			}
			// console.log(api_messages, messages_res);
        },
		send_message() {
			this.message = this.message.trim();
			if (this.gifMode) {
				this.search_gif();
				return ;
			}
			if (this.message != '') {
				const api_new_msg = this.$base_url + 'messages/new_message';

				const obj_to_send = {
					"user_from": this.user.id,
					"user_to": this.other_user.id,
					"body": this.message
				}
				this.axios.post(api_new_msg, obj_to_send, {withCredentials: true});
				this.message = '';
			}
		},
		send_gif(gif_url) {
			if (gif_url != '') {
				const api_new_msg = this.$base_url + 'messages/new_message';

				const obj_to_send = {
					"user_from": this.user.id,
					"user_to": this.other_user.id,
					"body": ' ',
					"gif": true,
					"gif_url": gif_url
				}
				this.axios.post(api_new_msg, obj_to_send, {withCredentials: true});
				gif_url = '';
				this.gifMode = false;
				this.gifs = [];
			}
		},
		async search_gif() {
			if (this.message == '') {
				return ;
			}
			const api = ''; // need a giphy API // TODO: put this on backend
			const base_url = "https://api.giphy.com/v1/gifs/search?api_key=";

			let url = base_url + api + `&q=${this.message}&limit=10&rating=r&lang=en`;
			const res = await this.axios.get(url);
			this.gifs = res.data.data;
		},
		goToUser() {
			router.push(`/users/${this.other_user.username}`);
		},
		createInvitation() {
			this.socket.emit('request-private-game', this.other_user.username);
		},
		calc_date(date_to_check) {
			let date_1 = new Date(date_to_check);
			let date_2 = new Date();
			let to_return = '';
			const diff = date_2 - date_1;
			const num_of_days = diff / (1000 * 60 * 60 * 24); 
			if (num_of_days < 1) {
				const num_of_minutes = Math.floor((diff / 1000 / 60));
				if (num_of_minutes < 2)
					to_return = 'Few Seconds ago';
				else if (num_of_minutes > 2 && num_of_minutes < 61)
					to_return = num_of_minutes + ' minutes ago';
				else {
					const num_of_hours = Math.floor(num_of_minutes / 60);
					if (num_of_hours < 2)
						to_return = '1 hour ago';
					else
						to_return = num_of_hours + ' hours ago';
				}
			}
			else {
				if (num_of_days == 1)
					to_return = 'Yesterday';
				else
					to_return = Math.ceil(num_of_days).toString() + ' days ago';
			}
			return to_return; 
		},
    },
    created() {
		this.socket = io(this.$base_url, {withCredentials: true});
		this.socket.on('private-session-id', (id) => {
			this.message = `<a href='/game?id=${id}' class="invitation-link">Invitation for a game, click to join!</a>`;
			this.send_message();
			this.message = '';
		});
        this.get_infos();
    },
	mounted() {
		window.addEventListener("keypress", (e) => {
			if (e.key == 'Enter')
				this.send_message();
		})
	},
	beforeUnmount() {
		clearInterval(this.intervalId);
	},
}
</script>
<template>
	<div>
		<div class="grid messages-grid" style="margin-top: 20px;">
			<div class="col-12 lg:col-6 lg:col-offset-3 ">
				<Toolbar>
					<template #start>
						<p class="channel-title">You and <a @click="goToUser">{{this.other_user.custom_username != null ? this.other_user.custom_username : this.other_user.username }}</a></p>
						<!-- <i class="pi pi-bars p-toolbar-separator mr-2" /> -->
						<!-- <SplitButton label="Save" icon="pi pi-check" :model="items" class="p-button-warning"></SplitButton> -->
					</template>

					<template #end>
						<Button icon="pi pi-link" class="p-button-rounded p-button-warning p-button-outlined minimal-icon mr-2" v-tooltip="'Invite To a Game'" @click="createInvitation"/>
					</template>
				</Toolbar>
			</div>
		</div>
		<div class="grid grid-nogutter messages-grid" style="" v-if="!blockMode">
			<div class="col-12 lg:col-6 lg:col-offset-3" style="background: #ffff; padding: 40px; margin-bottom: 20px; margin-top:20px; border-radius: 10px;">
				<div v-html="messages_html" class="messages-container"></div> 
			</div>
			<div class="col-12 lg:col-6 lg:col-offset-3">
					<InputText type="text" v-model="message" :placeholder="placeholderMsg" id="message-input" class="p-inputtext-lg message-input"/>
					<i class="gif-mode-inactive" style="margin-left: -60px; margin-right: 10px;" v-if="!gifMode" @click="gifMode = true;placeholderMsg='Search a Gif';">GIF</i>
					<i class="gif-mode-active" style="margin-left: -60px; margin-right: 10px;" v-if="gifMode" @click="gifMode = false;placeholderMsg='Enter a message';">GIF</i>
					<Button icon="pi pi-send" class="p-button-lg button-send" @click="this.send_message"/>
			</div>
			<!-- <div class="col-12 lg:col-6 lg:col-offset-3">
					<InputText type="text" v-model="gif_search" placeholder="Enter a gif search... " id="message-input" class="p-inputtext-lg message-input"/>
					<Button icon="pi pi-send" class="p-button-lg button-send" @click="this.search_gif"/>
			</div> -->
			<!-- <div class="col-12 lg:col-6 lg:col-offset-3">
				<div class="grid grid-nogutter" style="background: #fff;">
					<div class="col-2" v-for="gif in gifs">
						<img :src="gif.images.original.url" @click="send_gif(gif.images.original.url)" style="width: 150px;"/>
					</div>
				</div>
			</div> -->
			<div class="col-12 lg:col-6 lg:col-offset-3">
				<div class="row-gifs">
					<div v-for="gif in gifs">
						<img :src="gif.images.original.url" @click="send_gif(gif.images.original.url)" style="width: 150px;"/>
					</div>
				</div>
			</div>
		</div>
		<!-- <div class="bottom-form" v-if="!blockMode">
			<input type="text" placeholder="Enter message..." id="message-input" style="width: 80%;" v-model="message">
			<button style="width: 20%;" class="send-btn" @click="this.send_message">send</button>
		</div>  -->

		<div class="centered-perf" v-if="blockMode">
			<p>Unable to send messages with this user 😕</p>
		</div>
	</div>
</template>

<style lang="scss">
body {
    background-image: linear-gradient(to bottom, #434343 0%, black 100%);
}

.centered-perf {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
}

.centered-perf p {
	color: white;
	font-size: 30px;
}

.other-player-text {
	color: white;
	font-size: 1.5rem;
}

.other-player-text > a {
	cursor: pointer;
	color: blue;
}

.messages-grid {
	margin: 0;
	// padding: 50px;
}

@media(max-width: 767px) {
	.messages-grid {
		padding: 20px;
	}
}

.message {
	color: white;
	border-radius: 5px;
	padding: 5px 10px;
	display: inline-block;
}

.message#blue {
	background: blue;
	float: right;
	margin-top: -5px;
}

.message#green {
	margin-top: 5px;
	background: green;
}

.gif {
	background: transparent !important;
}

.gif small {
	color: black;
}

.gif#blue {
	float: right;
}

.message > a {
	color: white;
}

.message > a:hover {
	color: #00baa0;
}

.time {
	font-size: 12px;
	color: rgb(143, 143, 143);
	text-align: center;
	margin-top: 15px;
	margin-bottom: 5px;
}

.hour {
	font-size: 10px;
	margin-left: 8px;
}

.read {
	float: right;
	margin-top: 5px; 
	font-size: 12px;
}

.read#blue {
	color: blue;
}

.messages-container {
	max-height: 60vh;
	overflow-y: scroll;
	-ms-overflow-style: none; /* for Internet Explorer, Edge */
    scrollbar-width: none; /* for Firefox */
}

.messages-container::-webkit-scrollbar {
    display: none; /* for Chrome, Safari, and Opera */
}

.gif-mode-inactive {
	border-radius: 100%;
	padding: 10px;
	color: black;
	// background: black;
}

.gif-mode-active {
	border-radius: 100%;
	padding: 10px;
	color: white;
	background: black;
}

// .bottom-form {
// 	position: fixed;
// 	bottom: 0;
// 	width: 100%;
// 	background: #fff;
// }

.send-btn {
	background: rgb(229, 255, 0);
	padding: 30px;
	margin: 0;
	font-size: 1.0rem;
	// text-transform: uppercase;
	border: 1px solid black;
	cursor: pointer;
}

.send-btn:hover {
	border: 1px solid green;
	background: blue;
	color: white;
}

#message-input {
	background: white;
	font-size: 1.5rem;
	padding: 20px;
	border: none;
}

.leave-icon {
    color: white;
    background: rgb(62, 62, 62);
    padding: 20px;
    border-radius: 50%;
    cursor: pointer;
}

.message-input {
	width: 90%;
	border-radius: 10px 0 0 10px;
	//max-width: 900px;
}

.button-send {
	border-radius: 0 10px 10px 0;
	height: 100%;
	width: 10% !important;
	background: black;
	border: 1px solid black;
}

.channel-title {
    font-size: 25px;
	font-family: Montserrat;
	color: black;
}

.row-gifs {
  display: flex;
  flex-wrap: wrap;
  padding: 0 4px;
}

.row-gifs img {
	height: 150px;
}

/* Create four equal columns that sits next to each other */
.column-gif {
  flex: 25%;
  max-width: 25%;
  padding: 0 4px;
}

.column-gif img {
  margin-top: 8px;
  vertical-align: middle;
  height: 100%;
}

/* Responsive layout - makes a two column-layout instead of four columns */
@media screen and (max-width: 800px) {
  .column-gif {
    flex: 50%;
    max-width: 50%;
  }
}

/* Responsive layout - makes the two columns stack on top of each other instead of next to each other */
@media screen and (max-width: 600px) {
  .column-gif {
    flex: 100%;
    max-width: 100%;
  }
}




</style>