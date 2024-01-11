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
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import Badge from 'primevue/badge';
import BadgeDirective from 'primevue/badgedirective';
import Password from 'primevue/password';
import io from 'socket.io-client';


export default {
    data() {
        return {
			user: {},
			channel: {},
			ownerMode: false,
			members: null,
			achievements: [],
			avatar: '',
			friends: [],
			messages_html: '',
			message: '',
			members_html: '<li>sdkjhfskjdh <i class="pi pi-plus" @click="test"></i></li>',
			showMembers: false,
			adminMode: false,
			createInvitationModal: false,
			usernameToAdd: null,
			users_search_res: [],
			passwordToSet: '',
			showPasswordInput: false, 
			socket: {},
        }
    },
    methods: {
		async get_infos() {
			const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const id = urlParams.get('id');

			
            const api = `${this.$base_url}users/me`;
            const result = await this.axios.get(api, { withCredentials: true });
            this.user = result.data;
            this.avatar = result.data.avatar;
			this.achievements = result.data.achievements;


            // const api_channel = 'http://localhost:5050/channels/id/' + id;
			// const channel_res = await this.axios.get(api_channel, {withCredenti s : true});
            
            const api_channel = this.$base_url + 'channels/check/' + id;
			const channel_res = await this.axios.get(api_channel, {withCredentials : true});

			if (channel_res.data == 'failed' || channel_res.data == false) { // now try to insert user if channel is not private nor a pwd is required
                const api_private = this.$base_url + 'channels/is-private/' + id;
				const private_res = await this.axios.get(api_private, {withCredentials: true });
				if (private_res.data == true) {
					alert("this channel is private and you're not a member!");
					router.push('channels');
					return ;
				}
				else {
					const res = await this.axios.post(this.$base_url + 'channels/test/', {channel_id: id}, {withCredentials: true});
					const data = await this.axios.get(api_channel, {withCredentials : true});
					this.channel = data.data;
					
					router.push(`single-channel?id=${id}`);
				}
            }
            else if (channel_res.data != '') {
                this.channel = channel_res.data;
				if (this.channel.admins.includes(this.user.id))
					this.adminMode = true;
				if (this.channel.owner == this.user.id)
					this.ownerMode = true;
            }
			else {
				router.push('channels');
				return ;
			}
			const api_single_user = this.$base_url + 'users/';
			const iterate = this.channel.members;
			if (!this.members) {
				this.members = [];
				for(let i = 0; i < iterate.length; i++) {
					const res = await this.axios.get(api_single_user + iterate[i], {withCredentials: true});
					if (res.data != '')
						this.members.push(res.data);
				}
				for  (let i = 0; i < this.members.length; i++) {
					this.members[i].color = this.getRandomColor();
				}
			}
			this.get_chats();
			setInterval(this.get_chats, 1000);
		},

		getRandomColor() {
			let colors = ['bg-red', 'bg-green', 'bg-purple', 'bg-brown', 'bg-lightblue', 'bg-lemon', 'bg-lightred'];
			return colors[Math.floor(Math.random() * colors.length)];
		},

		isBlocked(other_user_id) {
			// const is_blocked = await this.axios.get(this.$base_url + 'users/is-blocked/' + other_user_id, {withCredentials: true});
			// console.log(is_blocked.data);
			// if (is_blocked.data)
			// 	return true;
			// return false;
			if (this.user.blocked_users.includes(parseInt(other_user_id))) {
				return true;
			}
			return false;
		},
		getMemberUsername(id) {
			if (id == this.user.id) {
				return 'You';
			}
			for(let i = 0; i < this.members.length; i++) {
				if (this.members[i].id == id) {
					return this.members[i].custom_username; 
				}
			}
			return 'Unknown';
		},
		getColor(id) {
			for(let i = 0; i < this.members.length; i++) {
				if (this.members[i].id == id) {
					return this.members[i].color; 
				}
			}
			return 'bg-green';
		},
        async get_chats()
        {
			const api_messages = this.$base_url + 'channels/singlechannel/find/' + this.channel.id;
			const messages_res = await this.axios.get(api_messages, {withCredentials: true});

			this.messages_html = '';
			for (let i = messages_res.data.length - 1; i >= 0; i--) {
				let color;
				let is_blocked = this.isBlocked(messages_res.data[i].user_from);
				// if (is_blocked) {
				// 	this.messages_html += `
				// 	<br><div class="time" id="green">Blocked User</div><br>
				// 	<div class="message" id="green">Hidden Message</div>` + '<br><br>';
				// }
				 // else {
					let username_bool = true;
					if (i == messages_res.data.length - 1) {
						username_bool = true;
					} else {
							if (messages_res.data[i + 1].user_from == messages_res.data[i].user_from) {
								username_bool = false;
							}
					}
					// console.log(i, messages_res.data[i].user_from, messages_res.data[i + 1].user_from, username_bool);
					if (messages_res.data[i].user_from == this.user.id)
						color = 'blue';
					else
						color = 'green';
					//let date = this.calc_date(messages_res.data[i].date);
					let date = new Date(messages_res.data[i].date);
					let hours = date.getHours();
					let minutes = date.getMinutes();
					if (minutes < 10) {
						minutes = "0" + minutes;
					}
					let hour = hours + ":" + minutes;
					if (!is_blocked) {
						if (username_bool) {
							this.messages_html += `
								<br><div class="time" id="${color}">${this.getMemberUsername(messages_res.data[i].user_from)}</div><br>
							`;
						}
						this.messages_html += `
							<div class="message ${this.getColor(messages_res.data[i].user_from)}" id="${color}"> ${messages_res.data[i].body} <small class='hour'>${hour}</small></div>` + (color === 'blue' ? '<br><br>' : '<br>') + 
							`
						`;
				 	} else {
						if (username_bool) {
							this.messages_html += `
								<br><div class="time" id="${color}">Blocked User</div><br>
							`;
						}
						this.messages_html += `
							<div class="message ${this.getColor(messages_res.data[i].user_from)}" id="${color}">Hidden Message <small class='hour'>${hour}</small></div>` + (color === 'blue' ? '<br><br>' : '<br>') + 
							`
						`;
					}
			}
			if (messages_res.data.length < 1) {
				this.messages_html = 'No messages';
			}
        },
		async send_message() {
			if (this.message != '') {
				const api_new_msg = `${this.$base_url}channels/${this.channel.id}/send-message`;
				const obj_to_send = {
					"channel_id": this.channel.id,
					"body": this.message
				}
				const res = await this.axios.post(api_new_msg, obj_to_send, {withCredentials: true});
				// (res);
				if (res.data == 'muted') {
					this.$toast.add({severity: 'warn', summary: 'Unable to send', detail: 'You are muted!', life: 3000});
				}
				this.message = '';
			}
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
				if (Math.floor(num_of_days) < 2)
					to_return = 'Yesterday';
				else
					to_return = Math.floor(num_of_days).toString() + ' days ago';
			}
			return to_return; 
		},
        async leaveChannel() {
            const api = this.$base_url + 'channels/leave/' + this.channel.id;
            const res = await this.axios.post(api, {}, {withCredentials: true});

            router.push('channels');
        },
		async getMembers() {
			this.showMembers = true;
			const api = this.$base_url + 'users/';
			const iterate = this.channel.members;
			if (!this.members) {
				this.members = [];
				for(let i = 0; i < iterate.length; i++) {
					const res = await this.axios.get(api + iterate[i], {withCredentials: true});
					
					if (res.data != '')
						this.members.push(res.data);
				}
				for  (let i = 0; i < this.members.length; i++) {
					this.members[i].color = this.getRandomColor();
				}
				
			}
		},
		showUsername(member) {
			if (member.username == this.user.username)
				return "You";
			if (member.custom_username)
				return member.custom_username;
			return member.username;
		},
		openInvitation() {
			this.createInvitationModal = true;
		},
		async retrieveUsers() {
			if (!this.adminMode || !this.usernameToAdd)
				return ;
			const user_search_api = this.$base_url + "users/findbyuser/" + this.usernameToAdd;
			const res_user = await this.axios.get(user_search_api, {withCredentials: true });
			this.users_search_res = res_user.data;
		},
		async createInvitation(id) {
			const api = this.$base_url + "channels/create-invitation/";
			const res = await this.axios.post(api, {user_id: id, channelId: this.channel.id}, {withCredentials: true});

			if (res.data == 'OK') {
				this.$toast.add({severity: 'success', summary: 'Success', detail: 'User was added to the channel', life: 3000});
				this.usernameToAdd = '';
				this.createInvitationModal = false;
				this.getMembers();
			} else {
				this.$toast.add({severity: 'error', summary: 'Error', detail: 'General error', life: 3000});
				this.usernameToAdd = '';
				this.createInvitationModal = false;
			}
			this.get_infos();

		},
		async makeAdmin(id) {
			const api = `${this.$base_url}channels/${this.channel.id}/make-admin`;
			const res = await this.axios.patch(api, {userToAddId: id}, {withCredentials:true});
		},
		async removeAdmin(id) {
			const api = `${this.$base_url}channels/${this.channel.id}/remove-admin`;
			const res = await this.axios.patch(api, {userToAddId: id}, {withCredentials:true});
			
			this.get_infos();
			this.getMembers();
		},
		async banUser(id) {
			const api = this.$base_url + "channels/ban";
			const res = await this.axios.patch(api, {userId: id, channelId: this.channel.id}, {withCredentials: true});

			this.get_infos();
			this.getMembers();
		},
		async muteUser(id) {
			const api = this.$base_url + "channels/mute";
			const res = await this.axios.patch(api, {userId: id, channelId: this.channel.id}, {withCredentials: true});

			this.get_infos();
			this.getMembers();
		},
		async unMuteUser(id) {
			const api = this.$base_url + "channels/remove-mute";
			const res = await this.axios.patch(api, {userId: id, channelId: this.channel.id}, {withCredentials: true});

			this.get_infos();
			this.getMembers();
		},
		async setPassword() {
			const api = this.$base_url + "channels/set-password";
			const res = await this.axios.patch(api, {password: this.passwordToSet, channelId: this.channel.id}, {withCredentials: true});

			this.passwordToSet = '';
			this.get_infos();
			this.getMembers();

			console.log(res);
		}
    },
    created() {
		this.socket = io(this.$base_url, {
				withCredentials: true
		});
        this.get_infos();
    },
	mounted() {
		window.addEventListener("keypress", (e) => {
			if (e.key == 'Enter')
				this.send_message();
		})
	}
}
</script>
<template>
<div>
		<Toast position="top-right" />
		<div class="grid messages-grid " style="margin-top: 20px;">
			<div class="col-12 lg:col-6 lg:col-offset-3">
				<Toolbar>
					<template #start>
						<p class="channel-title">{{channel.title}}</p>
					</template>

					<template #end>
						<Button icon="pi pi-plus" class="p-button-rounded p-button-warning p-button-outlined minimal-icon mr-2" v-tooltip="'Invite Someone'" @click="openInvitation" v-if="this.adminMode"/>
						<Button icon="pi pi-search" v-tooltip="'See Members'" @click="getMembers" class="p-button-rounded p-button-warning p-button-outlined minimal-icon mr-2" />
						<Button icon="pi pi-key" v-if="this.ownerMode" @click="this.showPasswordInput = !this.showPasswordInput" class="p-button-rounded p-button-warning p-button-outlined minimal-icon mr-2" v-tooltip="'Add a Password'" />
						<Button icon="pi pi-times" class="p-button-rounded p-button-warning p-button-outlined minimal-icon mr-2" v-tooltip="'Leave Channel'" @click="leaveChannel" />
						<Password id="username" v-show="this.ownerMode && showPasswordInput" v-model="passwordToSet" placeholder="Enter Password" toggleMask />
						<Button icon="pi pi-check" v-show="this.ownerMode && showPasswordInput" class="mr-2" v-tooltip="'Submit Password'" @click="setPassword" />
					</template>
				</Toolbar>
			</div>
		</div>


		<Dialog header="Members" v-model:visible="showMembers" :breakpoints="{'960px': '75vw'}" :style="{width: '50vw'}" contentClass="members-dialog" :modal="true">
			<div class="card justify-content-center align-content-center" v-for="member in members" style="width:100%;">
				<div class="grid flex align-content-start" style="margin-top: 5px; width: 100%; padding: 30px;" v-if="!this.channel.admins.includes(parseInt(member.id))">
					<div class="col-4">
						<RouterLink v-bind:to="{ path: '/users/' + member.username}">
							<Avatar v-bind:image="member.avatar" shape="circle" size="xlarge" />
						</RouterLink>
					</div>
					<div class="col-4 flex align-items-center justify-content-center">
						<p>{{member.custom_username != null ? member.custom_username : member.username}}</p>
					</div>
					<div class="col-4 flex align-items-center justify-content-center" v-show="adminMode">
						<Button class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip.top="'Make admin'" @click="makeAdmin(member.id)" v-if="adminMode && member.username != this.user.username && !this.channel.admins.includes(parseInt(member.id))" icon="pi pi-star" />
						<Button class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip.top="'Remove admin'" @click="removeAdmin(member.id)" v-if="adminMode && member.username != this.user.username && this.channel.admins.includes(parseInt(member.id))" icon="pi pi-user-minus" />
						<Button class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip.top="'Ban'" @click="banUser(member.id)" v-if="adminMode && member.username != this.user.username" icon="pi pi-times" />
						<Button class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip.top="'Mute'" @click="muteUser(member.id)" v-if="adminMode && member.username != this.user.username && !this.channel.muted.includes(parseInt(member.id))" icon="pi pi-volume-off" />
						<Button class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip.top="'Un Mute'" @click="unMuteUser(member.id)" v-if="adminMode && member.username != this.user.username && this.channel.muted.includes(parseInt(member.id))" icon="pi pi-volume-up" />
					</div>
				</div>
				<div class="grid flex align-content-start" style="margin-top: 5px; width: 100%; padding: 30px;" v-else>
					<div class="col-4">
						<RouterLink v-bind:to="{ path: '/users/' + member.username}" v-if="this.channel.owner != member.id">
							<Avatar v-bind:image="member.avatar" shape="circle" size="xlarge" v-badge.danger="'Admin'"/>
						</RouterLink>
						<RouterLink v-bind:to="{ path: '/users/' + member.username}" v-else>
							<Avatar v-bind:image="member.avatar" shape="circle" size="xlarge" v-badge.danger="'Owner'"/>
						</RouterLink>
					</div>
					<div class="col-4 flex align-items-center justify-content-center">
						<p>{{member.custom_username != null ? member.custom_username : member.username}}</p>
					</div>
					<div class="col-4 flex align-items-center justify-content-center" v-if="adminMode && member.id != this.channel.owner">
						<Button class="p-button-rounded p-button-warning p-button-outlined minimal-icon"  v-tooltip.top="'Make admin'" @click="makeAdmin(member.id)" v-if="adminMode && member.username != this.user.username && !this.channel.admins.includes(parseInt(member.id))" icon="pi pi-star" />
						<Button class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip.top="'Remove admin'" @click="removeAdmin(member.id)" v-if="adminMode && member.username != this.user.username && this.channel.admins.includes(parseInt(member.id))" icon="pi pi-user-minus" />
						<Button class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip.top="'Ban'" @click="banUser(member.id)" v-if="adminMode && member.username != this.user.username" icon="pi pi-times" />
						<Button class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip.top="'Mute'" @click="muteUser(member.id)" v-if="adminMode && member.username != this.user.username && !this.channel.muted.includes(parseInt(member.id))" icon="pi pi-volume-off" />
						<Button class="p-button-rounded p-button-warning p-button-outlined minimal-icon" v-tooltip.top="'Un Mute'" @click="unMuteUser(member.id)" v-if="adminMode && member.username != this.user.username && this.channel.muted.includes(parseInt(member.id))" icon="pi pi-volume-up" />
					</div>
				</div>
			</div>
			
		</Dialog>

		<Dialog header="Add Member" v-if="adminMode" v-model:visible="createInvitationModal" :breakpoints="{'960px': '75vw'}" :style="{width: '50vw'}" :modal="true">
			<InputText type="text" v-model="usernameToAdd" placeholder="Enter User to add ..." class="input-username" />
			<Button type="button" icon="pi pi-search" @click="retrieveUsers" style="border-radius: 0 10px 10px 0;" />
			<div class="card" v-for="user in users_search_res" style="margin-top: 20px; width: 250px;">
				<div class="flex align-content-center flex-wrap card-container yellow-container" style="min-height: 50px;">
					<div class="flex align-items-center justify-content-center font-bold text-gray-900 border-round m-2" style="min-width: 55px; min-height: 50px"><Avatar v-bind:image="user.avatar" shape="circle" size="large"></Avatar></div>
					<div class="flex align-items-center justify-content-center font-bold text-gray-900 border-round m-2" style="min-width: 55px; min-height: 50px"><p style="font-size: 15px;">{{user.username}}</p></div>
					<div class="flex align-items-center justify-content-center font-bold text-gray-900 border-round m-2" style="min-width: 55px; min-height: 50px"><Button icon="pi pi-plus" class="p-button-rounded p-button-success" @click="createInvitation(user.id)"/></div>
				</div>
			</div>
			<div v-if="users_search_res.length == 0" style="padding-top: 20px;">
				No user found
			</div>
		</Dialog>




		<div class="grid grid-nogutter messages-grid " style="">
			<div class="col-12 lg:col-6 lg:col-offset-3" style="background: #ffff; padding: 40px; margin-top: 20px; margin-bottom:20px; border-radius: 10px;">
				<div v-html="messages_html" class="messages-container"></div> 
			</div>
			<div class="col-12 lg:col-6 lg:col-offset-3">
					<InputText type="text" v-model="message" placeholder="Enter a message... " id="message-input" class="p-inputtext-lg message-input"/>
					<Button icon="pi pi-send" class="p-button-lg button-send" @click="this.send_message"/>
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

.input-username {
	border-radius: 6px 0 0 6px;
}

.card {
    padding: 0 !important;
}

.message {
	color: white;
	border-radius: 5px;
	padding: 5px 10px;
	display: inline-block;
}


.message#green {
	background: green;
	margin-top: 5px;
}

.bg-red {
	background: red !important;
}

.bg-lightred {
	background: #ff3c3c !important;
}

.bg-green {
	background: green !important;
}

.bg-purple{
	background: rgb(195, 0, 255) !important;
} 

.bg-brown {
	background: #a57665 !important;
} 

.bg-lightblue {
	background: rgb(0, 183, 255) !important;
}

.bg-lemon {
	background: #e0d040 !important;
}

.message#blue {
	background: blue !important;
	float: right;
}

.username#blue {
	float: right;
}

.time {
	font-size: 12px;
	color: rgb(143, 143, 143);
}

.time#blue {
	float: right;
	// margin-top: -5px;
}

.time#green {
	float: left;
	margin-top: 0px;
	margin-bottom: -5px !important;
}

.hour {
	font-size: 10px;
	margin-left: 8px;
}

.message-image {
	width: 40px;
	border-radius: 100%;
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

.messages-grid {
	margin: 0;
	// padding: 50px;
}

.bottom-form {
	position: fixed;
	bottom: 0;
	width: 100%;
	background: #fff;
}

.send-btn {
	background: none;
	padding: 30px;
	margin: 0;
	font-size: 1.5rem;
	text-transform: uppercase;
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

.channel-title {
    font-size: 25px;
	color: black;
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

.members-dialog {
text-align: center;
align-content: center;
}

</style>