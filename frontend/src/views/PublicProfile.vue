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
import Tooltip from 'primevue/tooltip';

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
			achievements_html: '',
			friends: [],
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
			areFriends: false,
			isBlocked: false,
			history_users: [],
        }
    },
    methods: {
        async get_image(username)
        {
/*             const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const username = urlParams.get('username'); */
			// const username = this.$route.params.username;
            const api_url = this.$base_url + 'users/findbyuser/';
            const result = await this.axios.get(api_url + username, { withCredentials: true });
            if (result.data == '') {
                return;
            }

            this.user = result.data[0];
			
			const api_blocked = this.$base_url + "users/is-blocked/" + this.user.id;
			const res_blocked = await this.axios.get(api_blocked, {withCredentials: true});

			if (res_blocked.data	)
				this.isBlocked = true;

			console.log(res_blocked);
            this.avatar = this.user.avatar;
			if (this.user.custom_username)
				this.usernameToShow = this.user.custom_username;
			else
				this.usernameToShow = this.user.username;
			if (this.user.status == 'online') {
				this.statusHtml = `<p style="color: black;"><i class="pi pi-circle-fill" style="color: green; font-size: 0.7rem;" ></i> ${this.user.status}</p>`
			}
			else if (this.user.status == 'gaming') {
				this.statusHtml = `<p style="color: black;"><i class="pi pi-circle-fill" style="color: #e88305; font-size: 0.7rem;" ></i> ${this.user.status}</p>`
			}
			else {
				this.statusHtml = `<p style="color: black;"><i class="pi pi-circle-fill" style="color: red; font-size: 0.7rem;" ></i> ${this.user.status}</p>`
			}
			this.achievements = [];
			for(var i = 0; i < this.user.achievements.length; i++) {
				if (this.user.achievements[i]) {
					const res = await this.axios.get(`${this.$base_url}achievements/${this.user.achievements[i]}`);
					this.achievements.push(res.data); 
				}
			}
            if (this.user.twoFactorEnabled) {
                this.checked = true;
                this.two_auth_text = '2fa Enabled';
            }
            else
                this.two_auth_text = 'Enable 2fa';

			const api_friends = `${this.$base_url}users/${this.user.id}/friends`;
			const res_friends = await this.axios.get(api_friends, { withCredentials: true });
			this.friends = res_friends.data;

			const api_are_friends = `${this.$base_url}users/${this.user.id}/are-friends`;
			const res_are_friends = await this.axios.get(api_are_friends, {withCredentials: true});
			
			if (res_are_friends.data == true) {
				this.areFriends = true;
			}

			const api_history = `${this.$base_url}users/${this.user.id}/history`;
			const api_single_id = this.$base_url + "games/";
			const res_history = await this.axios.get(api_history, { withCredentials: true });
			for(let index = 0; index < res_history.data.length; index++) {
				const res_single_game = await this.axios.get(api_single_id + res_history.data[index].id);
				// const str = JSON.stringify(res_single_game.data);
				// console.log(JSON.parse(str));
				console.log(res_single_game.data.final_score);
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
		openConversation() {
			// window.location.href = `/singlechat?username=${this.user.username}`;
			router.push(`/singlechat?username=${this.user.username}`);
		},
		async addAsFriend() {
			const api = `${this.$base_url}users/add-friend/${this.user.id}`;
			const res = await this.axios.post(api, {}, {withCredentials: true});

			if (res.data == 'done') {
				this.$toast.add({severity: 'success', summary: 'Added as friend', detail: 'This user is now your friend', life: 3000});
				this.get_image(this.$route.params.username);
			}
			else {
				this.$toast.add({severity: 'error', summary: 'Unable to add as friend', detail: 'Something went wrong', life: 3000});
			}
		},
		async removeFriend() {
			const api = `${this.$base_url}users/remove-friend/${this.user.id}`;
			const res = await this.axios.patch(api, {}, {withCredentials: true});

			console.log(res.data);

			if (res.data == 'done') {
				this.$toast.add({severity: 'success', summary: 'Removed from friends', detail: 'This user is no longer your friend', life: 3000});
				this.reset();
				this.get_image(this.$route.params.username);
				this.areFriends = false;
			}
			else {
				this.$toast.add({severity: 'error', summary: 'Unable to remove friend', detail: 'Something went wrong', life: 3000});
			}
		},
		async blockUser() {
			const api = this.$base_url + "users/block/user";
			const res = await this.axios.patch(api, {userId: this.user.id}, {withCredentials: true});
			if (res.data == 'OK')
				this.isBlocked = true;
		},
		async unblockUser() {
			const api = this.$base_url + "users/unblock/user";
			const res = await this.axios.patch(api, {userId: this.user.id}, {withCredentials: true});
			if (res.data == 'OK')
				this.isBlocked = false;
			console.log(res.data);
		},
		reset() {
			this.checked = false;
			this.show = false;
			this.value = '';
			this.code = '';
			this.avatar = '';
			this.user = {};
			this.usernameToShow = null;
			this.achievements = [];
			this.achievements_html = '';
			this.friends = [];
			this.statusHtml = '';
			this.qr_src = '';
			this.two_auth_text = '';
			this.knob_value = 0;
			this.displayResponsive = false;
			this.displayModalAchievements = false;
			this.displayModal2FA = false;
			this.displayModalFriends = false;
			this.displayModalHistory = false;
			this.areFriends = false;
			this.isBlocked = false;
			this.history_users = [];
		}
    },
    created() {
        // const queryString = window.location.search;
        // const urlParams = new URLSearchParams(queryString);
        // const product = urlParams.get('username');
        // console.log(product);
        // const api = 'http://localhost:5050/users/';
        // const result = await this.axios.get(api, { withCredentials: true });

       this.get_image(this.$route.params.username);
	   // console.log(this.$route.params);

	    this.$watch(
		() => this.$route.params,
		(toParams, previousParams) => {
			// react to route changes...
			this.checked = false,
			this.show = false,
			this.value = '',
			this.code = '',
			this.avatar = '',
			this.user = {},
			this.usernameToShow = null,
			this.achievements = [],
			this.achievements_html = '',
			this.friends = [],
			this.statusHtml = '',
			this.qr_src = '',
			this.two_auth_text = '',
			this.knob_value = 0,
			this.displayResponsive = false,
			this.displayModalAchievements = false,
			this.displayModal2FA = false,
			this.displayModalFriends = false,
			this.displayModalHistory = false,
			this.areFriends = false,
			this.isBlocked = false,
			this.history_users = [],
			this.get_image(toParams.username);
		}
		)
    },
}
</script>
<template>
<div class="grid grid-nogutter flex align-items-center justify-content-center" style="padding: 30px;">
<Toast position="top-right" />
    <div class="sm:col-12 md:col-12 lg:col-4" >
        <div class="card my-card">
			<div class="grid">
				<div class="col-12 md:col-12 lg:col-12"  style="padding: 60px;">
					<div class="flex align-items-center text-center justify-content-center flex-wrap card-container">
						<div class="image-cropper">
							<img :src="avatar" style="" class="profile-pic">
						</div>
						<!-- <div class="col-12" style="padding: 15px;">
							<Button  icon="pi pi-upload" class="p-button-rounded p-button-outlined" />
						</div> -->
                        <div class="col-12">
                            <div class="username">
                                <p>{{this.usernameToShow}}</p>
                            </div>
                        </div>
						<!-- <div class="col-12">
							<Button icon="pi pi-ban" @click="blockUser" class="class=p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip="'Block User'" v-if="!this.isBlocked" />
							<Button icon="pi pi-eye-slash" class="class=p-button-rounded p-button-warning p-button-outlined minimal-icon" @click="unblockUser" v-tooltip="'Remove Block'" v-else />
						</div> -->
						<div class="col-12 text-center" v-html="this.statusHtml">
						</div>
					</div>
					<div class="flex align-items-center text-center justify-content-center flex-wrap card-container">
						<!-- <div class="lg:col-2"></div>-->
						<div class="col-2 mr-2" style="margin-top: 20px; margin-bottom: 20px;">
							<Button icon="pi pi-comment" v-tooltip="'Start a chat'" class="p-button-rounded p-button-warning p-button-outlined minimal-icon" @click="openConversation"/>
						</div>
						<div class="col-2 mr-2" style="margin-top: 20px; margin-bottom: 20px;">
							<Button icon="pi pi-user-plus" v-tooltip="'Add as Friend'" class="p-button-rounded p-button-warning p-button-outlined minimal-icon" @click="addAsFriend" v-if="!areFriends" />
							<Button icon="pi pi-user-minus" v-tooltip="'Unfriend'" class="p-button-rounded p-button-warning p-button-outlined minimal-icon" @click="removeFriend" v-if="areFriends" />
						</div>
						<!-- <div class="grid align-items-center text-center lg:justify-content-between sm:justify-content-center" style="width: 100%;"> -->
							<div class="col-2 mr-2 ">
								<Button icon="pi pi-star" class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip="'Achievements'" @click="openModalAchievements" />
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
										<p>This user does not have achievements</p>
									</div>
								</Dialog>
							</div>
							<div class="col-2 mr-2 ">
								<Button icon="pi pi-users" class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip="'Friends'" @click="openModalFriends" />
								<Dialog v-model:visible="displayModalFriends" :breakpoints="{'960px': '75vw'}" style="width: 100%; max-width: 500px;" :modal="true">
 									<div class="card" v-for="friend in friends" style="cursor: pointer;">
										<div class="grid align-items-center text-center" style="margin-top: 5px; width: 100%;">
											<div class="col-6">
												<RouterLink v-bind:to="{ path: '/users/' + friend.username}">
													<Avatar v-bind:image="friend.avatar" shape="circle" size="xlarge" />
												</RouterLink>
											</div>
											<div class="col-6">
												<p>{{friend.custom_username != null ? friend.custom_username : friend.username}}</p>
											</div>
										</div>
									</div>
									<div v-if="friends.length < 1">
										<p>This user does not have friends</p>
									</div>
								</Dialog>
							</div>
							<div class="col-2 mr-2 ">
								<Button icon="pi pi-history" class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip="'History'" @click="openModalHistory" />
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
										<p>This user did not play any match</p>
									</div>
								</Dialog>
							</div>
							<div class="col-12">
								<Button icon="pi pi-ban" label="Block" @click="blockUser" class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip="'Block User'" v-if="!this.isBlocked" />
								<Button icon="pi pi-eye-slash" label="Remove Block" class="p-button-rounded p-button-warning p-button-outlined minimal-icon" @click="unblockUser" v-tooltip="'Remove Block'" v-else />
							</div>
						<!-- </div> -->
					</div>
				</div>
			</div>
        </div>
    </div>
</div>
</template>

<style lang="scss">
body {
    background-image: linear-gradient(to bottom, #434343 0%, black 100%);
}

p {
	color: black;
}

.card {
    padding: 0 !important;
}
.my-card {
	margin-top: 70px;
    width: 100%;
    // height: 800px;
    border-radius: 10px;
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
		border: 3px solid black;
        // box-shadow: 0 0 0 5px #F72585,
        //         inset 0 0 0 5px #B5179E,
        //         inset 0 0 0 5px #F72585,
        //         inset 0 0 0 5px #B5179E,
        //         inset 0 0 0 5px #F72585,;
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
		// margin-left: 20px;
		margin-top: 10px;
	}
	.icon-divs p {
		color: black;
		margin-top: 10px;
	}
}

.qr-img > a > img {
    width: 200px;
}
</style>