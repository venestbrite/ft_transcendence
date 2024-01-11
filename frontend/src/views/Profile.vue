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
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import io from 'socket.io-client';

import Terminal from 'primevue/terminal';
import TerminalService from 'primevue/terminalservice';

export default {
    data() {
        return {
            checked: false,
            show: false,
            value: '',
            code: '',
            avatar: '',
            user: {},
			usernameToShow: null,
			achievements: [],
			statusHtml: '',
            qr_src: '',
            two_auth_text: '',
			knob_value: 0,
			displayResponsive: false,
			displayModalStats: false,
			displayModalAchievements: false,
			displayModal2FA: false,
			displayModalFriends: false,
			displayModalHistory: false,
			displayUsernameChange: false,
			newUsername: '',
			history_users: [],
			history_results: [],
			friends: [],
			socket: {},
			displayTerminal: false,
        }
    },
    methods: {
        async get_image()
        {

            const api = this.$base_url + 'users/me';
			let result = null;
			if (!this.$userLoggedIn) {
				try {
            		result = await this.axios.get(api, { withCredentials: true });
					this.$userLoggedIn = result.data;
				}
				catch(err) {
					router.push('/login');
					return ;
				}
			}
			else {
				result = this.$userLoggedIn;
				this.user = this.$userLoggedIn;
			}
			// 	this.$userLoggedIn = result.data;
            this.user = result.data;
            this.avatar = result.data.avatar;
			if (this.user.custom_username)
				this.usernameToShow = this.user.custom_username;
			else
				this.usernameToShow = this.user.username;
			// this.achievements = result.data.achievements;
			for(var i = 0; i < result.data.achievements.length; i++) {
				if (result.data.achievements[i]) {
					const res = await this.axios.get(`${this.$base_url}achievements/${result.data.achievements[i]}`);
					this.achievements.push(res.data); 
				}
			}
            if (this.user.twoFactorEnabled) {
                this.checked = true;
                this.two_auth_text = '2fa Enabled';
            }

			const api_friends = `${this.$base_url}users/${this.user.id}/friends`;
			const res_friends = await this.axios.get(api_friends, { withCredentials: true });
			this.friends = res_friends.data;

			const api_history = `${this.$base_url}users/${this.user.id}/history`;
			const api_single_id = this.$base_url + "games/";
			const res_history = await this.axios.get(api_history, { withCredentials: true });
			for(let index = 0; index < res_history.data.length; index++) {
				const res_single_game = await this.axios.get(api_single_id + res_history.data[index].id);
				// const str = JSON.stringify(res_single_game.data);
				// console.log(JSON.parse(str));
				let player_1 = res_single_game.data.user_1_id;
				let player_2 = res_single_game.data.user_2_id;
				let opponent;
				if (player_1 == this.user.id)
					opponent = player_2;
				else
					opponent = player_1;
				const api_single_user = `${this.$base_url}users/${opponent}`;
				const res_single_player = await this.axios.get(api_single_user, {withCredentials: true });
				this.history_users.push({
					opponent: res_single_player.data,
					match: res_single_game.data
				});
			}

			if (this.user.is_first_login) {
			 	router.push('/create-profile');
			}

        },
        async create_verification() {
            // alert(this.value);
            // '+' == %2b
            if (this.checked) {
                return ;
            }
            this.show = !this.show;
            this.checked = !this.checked;
            const api = `${this.$base_url}auth/generate-qr`;
            this.qr_src = await this.axios.get(api, { withCredentials: true });
			this.openResponsive();
        },
        verify_code() {
            if (this.user.twoFactorEnabled)
                return ;
            let api = this.$base_url + 'auth/verify-g-code';
            let number_to_send = '%2b' + this.value.substr(1,2) + this.value.substr(4);
            let code_to_send = this.code;
            this.axios.get(api + '?code=' + code_to_send, { withCredentials: true }).then((response) => {
                console.log(response);
                if (response.data == 'approved') {
                    this.$toast.add({severity: 'info', summary: 'Success', detail: '2FA Activated', life: 3000});
					setTimeout(() => {
						window.location.href = '/profile';
					}, 2500);
				}
                else
					this.$toast.add({severity: 'error', summary: 'Error', detail: 'Something went wrong', life: 3000});
            })
        },
		async deactivate2FA() {
			const api = `${this.$base_url}auth/remove-2FA`;
            const res = await this.axios.post(api, {}, { withCredentials: true });
			if (res.data == 'success') {
				// show success message
				this.$toast.add({severity: 'info', summary: 'Success', detail: '2FA Deactivated', life: 3000});
				setTimeout(() => {
					window.location.href = '/profile';
				}, 2500);
			}
			else {
				// show failure message
				this.$toast.add({severity: 'error', summary: 'Error', detail: 'Something went wrong', life: 3000});
				setTimeout(() => {
					window.location.href = '/profile';
				}, 2500);
			}
		},
		openResponsive() {
            this.displayResponsive = true;
        },
        closeResponsive() {
            this.displayResponsive = false;
        },
		openModalStats() {
            this.displayModalStats = true;
        },
		openModalAchievements() {
			this.displayModalAchievements = true;
		},
		openModal2FA() {
			this.displayModal2FA = true;
			this.create_verification();
		},
		openModalFriends() {
			this.displayModalFriends = true;
		},
		openModalHistory() {
			this.displayModalHistory = true;
		},
		openUsernameChange() {
			this.displayUsernameChange = true;
		},
		async myUploader(event) { //event.files == files to upload
			const api = this.$base_url + 'users/avatar/' + this.user.username;
			const data = {
				"avatar": event.files[0]
			}
			let formData = new FormData();
			formData.append('avatar', event.files[0]);
			console.log('>> formData >> ', formData);
			// You should have a server side REST API 
			const res = await axios.post(api,
				formData, {
					headers: {
					'Content-Type': 'multipart/form-data'
					},
					withCredentials: true,
				}
			)
			window.location.href = '/profile';
		},
		async changeUsername() {
			this.newUsername = this.newUsername.trim();
			if (this.newUsername == '') {
				this.$toast.add({severity: 'error', summary: 'Error', detail: 'Username cannot be empty', life: 3000});
				return ;
			}
			const api = `${this.$base_url}users/${this.user.id}/change-username`;
			const res = await this.axios.patch(api, {username: this.newUsername}, {withCredentials: true});

			if (res.data === 'approved') {
				this.$toast.add({severity: 'success', summary: 'Success', detail: 'Username changed', life: 3000});
				this.usernameToShow = this.newUsername;
				this.newUsername = '';
			}
			else if (res.data == 'not unique')
				this.$toast.add({severity: 'error', summary: 'Error', detail: 'Username already in use!', life: 3000});
			else
				this.$toast.add({severity: 'error', summary: 'Error', detail: 'Something went wrong', life: 3000});
		},
		chooseStyle(status: string) {
			if (!status || status == 'offline')
				return 'color:red;';
			if (status == 'gaming')
				return 'color: orange;';
			return 'color:lightgreen';

		},
		commandHandler(text) {
            let response;
            let argsIndex = text.indexOf(' ');
			let command = text.split(' ');
            // let command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;

            switch(command[0]) {
                case "date":
                    response = 'Today is ' + new Date().toDateString();
                    break;

                case "random":
                    response = Math.floor(Math.random() * 100);
                    break;
				
				case "change":
					if (command[1] == 'username') {
						if (command[2].trim() != '') {
							this.newUsername = command[2];
							this.changeUsername();
							response = "Username changed";
						} else {
							response = "Empty username";
						}
					}
					break;

                default:
                    response = "Command not found: " + text.trim();
            }

            TerminalService.emit('response', response);
        }
    },
    created() {
		this.socket = io(this.$base_url, {
				withCredentials: true
		});
        this.get_image();
		//console.log(process.env.VUE_APP_TITLE);
    },
	mounted() {
		TerminalService.on('command', this.commandHandler);
		document.addEventListener('keypress', (ev) => {
			if (ev.key == ',') {
				this.displayTerminal = true;
			}
		})
	},
	beforeUnmount() {
        TerminalService.off('command', this.commandHandler);
    }
}
</script>
<template>
<Toast position="center" />
<div class="bg"></div>
<div class="bg bg2"></div>
<div class="bg bg3"></div>
<Dialog v-model:visible="displayTerminal" :breakpoints="{'960px': '75vw'}" style="width: 100%; max-width: 500px; background: #2c2c2c;" :modal="true">
	<Terminal welcomeMessage="Transcendence Terminal" prompt="transcendence $ " />
</Dialog>
<div class="grid grid-nogutter flex align-items-center justify-content-center" style="padding: 30px;">
    <div class="sm:col-12 md:col-6 lg:col-4" >
        <div class="card my-card">
			<div class="grid">
				<div class="sm:col-12 md:col-12 lg:col-12"  style="padding: 60px;">
					<div class="flex align-items-center text-center justify-content-center flex-wrap card-container">
						<div class="image-cropper">
							<img :src="avatar" style="" class="profile-pic">
						</div>
						<div class="col-12" style="padding: 15px;">
							<!-- <Button  icon="pi pi-upload" class="p-button-rounded p-button-outlined" /> -->
							<FileUpload name="demo[]" mode="basic" chooseIcon="pi pi-upload" chooseLabel="Change Image" :customUpload="true" @uploader="myUploader" class="uploader" :auto="true" />
						</div>
						<div  class="col-12 username">
							<p>{{this.usernameToShow}}</p>
						</div>
						<Dialog header="Username Change" v-model:visible="displayUsernameChange" :breakpoints="{'960px': '75vw'}" :style="{width: '50vw'}" class="new-channel-modal" :modal="true">
							<div style="margin-top: 20px; margin-bottom: 20px;">
								<span class="p-float-label">
									<InputText id="username" type="text" class="full-w" v-model="newUsername" />
									<label for="username">Username</label>
								</span>
							</div>
								<Button label="Change" class="uploader full-w" iconPos="right" @click="changeUsername"/>
						</Dialog>
						<div class="col-12">
							<Button label="Change Username" class="uploader" icon="pi pi-user-edit" iconPos="left" @click="openUsernameChange"/>
						</div>
					</div>
					<div class="flex align-items-center text-center justify-content-center flex-wrap card-container" style="margin-top:20px;">
						<!-- <div class="lg:col-2"></div>
						<div class="lg:col-2"></div> -->
						<div class="grid align-items-center text-center sm:justify-content-center">
							<div class="lg:col-2 md:col-3 sm:col-3 icon-divs">
								<Button icon="pi pi-star" class="p-button-rounded p-button-warning p-button-outlined minimal-icon" @click="openModalAchievements" v-tooltip="'Achievements'"/>
								<Dialog v-model:visible="displayModalAchievements" :breakpoints="{'960px': '75vw'}" style="width: 100%; max-width: 500px;" :modal="true">
									<div class="card" v-for="achievement in achievements">
										<div class="grid align-items-center text-center" style="margin-top: 5px; width: 100%;">
											<div class="col-4">
												<img v-bind:src="this.$base_url + achievement.image" alt="" style="width: 80px; border-radius: 100%;">
											</div>
											<div class="col-4">
												<p>{{achievement.title}}</p>
											</div>
											<div class="col-4">
												<p>{{achievement.description}}</p>
											</div>
										</div>
									</div>
									<div v-if="achievements.length < 1">
										<p>No achievements earned yet, go play! 🏆</p>
									</div>
								</Dialog>
								<p></p>
							</div>
							<div class="lg:col-2 md:col-3 sm:col-3 icon-divs">
								<Button icon="pi pi-users" class="p-button-rounded p-button-outlined minimal-icon" @click="openModalFriends" v-tooltip="'Friends'"/>
								<Dialog v-model:visible="displayModalFriends" :breakpoints="{'960px': '75vw'}" style="width: 100%; max-width: 500px;" :modal="true">
 									<div class="card" v-for="friend in friends" style="cursor: pointer;">
										<div class="grid align-items-center text-center" style="margin-top: 5px; width: 100%;">
											<div class="col-4">
												<RouterLink v-bind:to="{ path: '/users/' + friend.username}">
													<Avatar v-bind:image="friend.avatar" shape="circle" size="xlarge" />
												</RouterLink>
											</div>
											<div class="col-4">
												<p style="color: black;">{{friend.custom_username != null ? friend.custom_username : friend.username}}</p>
											</div>
											<div class="col-4">
												<p v-bind:style="chooseStyle(friend.status)">{{friend.status}}</p>
											</div>
										</div>
									</div>
									<div v-if="friends.length < 1">
										<p>You have no friends ☹️</p>
									</div>
								</Dialog>
								<p></p>
							</div>
							<div class="lg:col-2 md:col-3 sm:col-3 icon-divs">
								<Button icon="pi pi-history" class="p-button-rounded p-button-outlined minimal-icon" @click="openModalHistory" v-tooltip="'History'"/>
								<Dialog v-model:visible="displayModalHistory" :breakpoints="{'960px': '75vw'}" style="width: 100%; max-width: 500px;" :modal="true">
									<div class="card" style="margin-top: 20px;" v-if="history_users.length > 0">
										<div class="grid" style="text-align:center; text-transform: uppercase;">
											<div class="col-4">VS</div>
											<div class="col-4">Outcome</div>
											<div class="col-4">Score</div>
										</div>
									</div>
									<div class="card" v-for="elem in history_users">
										<div class="grid align-items-center text-center">
											<div class="col-4">
												<RouterLink v-bind:to="{ path: '/users/' + elem.opponent.username}">
													<Avatar v-bind:image="elem.opponent.avatar" shape="circle" size="xlarge" />
													<p>{{elem.opponent.custom_username != null ? elem.opponent.custom_username : elem.opponent.username}}</p>
												</RouterLink>
											</div>
											<div class="col-4">
												<p>{{elem.match.winner_id == this.user.id ? "Won" : "Lost"}}</p>
											</div>
											<div class="col-4">
												<p>{{elem.match.final_score}}</p>
											</div>
										</div>
									</div>
									<div v-if="history_users.length < 1">
										<p>No matches played yet. Go play! 🎮</p>
									</div>
								</Dialog>
								<p></p>
							</div>
							<div class="lg:col-2 md:col-3 sm:col-3 icon-divs" v-if="!this.user.twoFactorEnabled">
								<Button icon="pi pi-qrcode" class="p-button-rounded p-button-outlined minimal-icon" @click="openModal2FA" v-tooltip="'Activate 2FA'"/>
								<Dialog v-model:visible="displayModal2FA" :breakpoints="{'960px': '75vw'}" style="width: '100vw'; max-width: '500px';" :modal="true">
									<div class="flex align-items-center justify-content-center flex-wrap card-container" style="min-height: 320px;">
										<div v-html="this.qr_src.data" class="qr-img text-center">
										</div>
										<div class="col-12 text-center">
										<p>Scan this QrCode with your google Auth app, then use the code generated below to confirm!</p>
										</div>
									</div>
									<div class="text-center" v-if="show" style="" >
										<InputMask v-model="code" mask="999999" placeholder="Insert validation code" />
										<Button @click="verify_code" icon="pi pi-check" iconPos="right" />
									</div>
								</Dialog>
								<p></p>
							</div>
							<div class="lg:col-2 sm:col-4 icon-divs" v-else>
								<Button icon="pi pi-qrcode" class="p-button-rounded p-button-outlined minimal-icon" @click="deactivate2FA" v-tooltip="'Remove 2FA'"/>
								<p></p>
							</div>
						</div>
					</div>
				</div>
			</div>
        </div>
    </div>
</div>
</template>

<style lang="scss">
body {
    // background: linear-gradient(#F72585, #B5179E, #7209B7);
	background: black;
}

p {
	color: black;
}

.uploader {
	color: black;
	background: transparent;
	border: 1px solid black;
	border-radius: 3px;
}

.uploader:hover {
	color: white !important;
	background: black !important;
	border: 1px solid black !important;
}

.card {
    padding: 0 !important;
}
.my-card {
	margin-top: 70px;
    width: 100%;
    // height: 800px;
    border-radius: 3px;
    box-shadow: 0 10px 25px 5px rgba(0, 0, 0, 0.2);
    background: white;
    overflow: hidden;

    .image-cropper {
        margin: auto;
		//margin-top: -100px;
        right: 0;
        left: 0;
        width: 175px;
        height: 175px;
        position: relative;
		// transform: translateY(-50%);
		z-index: 3;
        overflow: hidden;
        border-radius: 50%;
        // box-shadow: 0 0 0 5px #F72585,
        //         inset 0 0 0 5px #B5179E,
        //         inset 0 0 0 5px #F72585,
        //         inset 0 0 0 5px #B5179E,
        //         inset 0 0 0 5px #F72585,;
		border: 2px solid black;
        background: white;
        animation: mvTop 1.5s;
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
    .username {
        width: inherit;
        // height: 70px;
		// margin: 20px;
        text-align: center;
        animation: fadeIn 2s ease-in;
        p {
            padding: 5px 20px;
            border-radius: 10px;
            color: black;
            letter-spacing: 0.05em;
            text-decoration: none;
            font-size: 30px;
            transition: all 1s;
            &:hover {
                color: white;
                background: #560BAD;
            }
        }
    }
	.icon-divs {
		margin-left: 20px;
		margin-top: 10px;
	}
	.icon-divs p {
		color: black;
		margin-top: 10px;
		text-align: center;
		font-size: 10px;
	}
}

.qr-img > a > img {
    width: 200px;
}

.edit-icon {
	cursor: pointer;
	margin-left: 10px;
}
.edit-icon:hover {
	border: 1px solid white;
	padding: 10px;
	border-radius: 100%;
	color: black;
	background: white;
}

.bg {
//   animation:slide 3s ease-in-out infinite alternate;
//   background-image: linear-gradient(-60deg, rgb(0, 0, 0) 50%, rgb(112, 112, 112) 50%);
//   bottom:0;
//   left:-50%;
//   opacity:.5;
//   position:fixed;
//   right:-50%;
//   top:0;
//   z-index:-1;
	background-image: linear-gradient(to bottom, #434343 0%, black 100%);
}

.bg2 {
  animation-direction:alternate-reverse;
  animation-duration:4s;
}

.bg3 {
  animation-duration:5s;
}

.new-channel-modal {
	max-width: 450px;
}

.full-w {
	width: 100%;
}

.p-terminal {
	background: #2c2c2c;
	color: #7fff00;
}

.p-terminal-command {
	color: #80CBC4;
}

.p-terminal-prompt {
	color: #FFD54F;
}

.p-terminal-response {
	color: #9FA8DA;
}

</style>