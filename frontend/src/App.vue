<script setup lang="ts">
import { computed, defineComponent, reactive } from "vue";
import { useAppStore } from "./stores/app";
import { ref } from 'vue';
import { RouterLink, RouterView, useRoute } from "vue-router";
import SideBar from '@/components/commons/SideBar/SideBar.vue';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import router from '@/router';


import io from 'socket.io-client'
import Sidebar from 'primevue/sidebar';
import InputText from 'primevue/inputtext';

const menuBar = reactive([
	{
		label: 'Profile',
		icon: 'pi pi-id-card',
		to: '/profile',
		// items: [
		//   {
		//     label: 'View',
		//     icon: 'pi pi-fw pi-list'
		//   },
		//   {
		//     label: 'Search',
		//     icon: 'pi pi-fw pi-search'
		//   },
		// ]
	},
	{
		label: 'Game',
		icon: 'pi pi-play',
	 //  to: '/game',
		items: [
			{
				label: 'New Game',
				icon: 'pi pi-star',
				to: '/game',
			},
			{
				label: 'Watch a game',
				icon: 'pi pi-video',
				to: '/live',
			}
		]
	},
	{
		label: 'Chat',
		icon: 'pi pi-comments',
		to: '/chats',
	},
	{
		label: 'Channels',
		icon: 'pi pi-globe',
		to: '/channels',
	},
	{
		label: 'Ladder',
		icon: 'pi pi-sort-numeric-up',
		to: '/ladder'
	}
])
const options = reactive(['Light', 'Light']);
const store = useAppStore()
const darkValue = ref(true);

function changeTheme(): boolean {
	const themeElement: HTMLElement = document.getElementById('theme-link') as HTMLElement;
	const { isDark, themeColor } = store;
	
	themeElement.setAttribute('href', themeElement.getAttribute('href')!.replace(themeColor, "light"));
	//themeElement.setAttribute('href', themeElement.getAttribute('href')!.replace(themeColor, isDark ? "light" : "dark"));
	store.setTheme()
	return true;
}
changeTheme();


const moon = "pi pi-moon"
const checked = true


</script>

<script lang="ts">
import SocketioService from './service/socketio.service';
export default {
	name: 'App',
	components: {},
	data() {
		return {
			searchVisible: false,
			searching: false,
			usernameToSearch: '',
			users: [],
			notHomepage: false,
			numNotif: 0,
			displayNotif: false,
			convos_users: [],
			messages: [],
			notifications: [],
		}
	},
	methods: {
	async retrieveUsers() {
		this.searching = true;
		if (!this.usernameToSearch || this.usernameToSearch == '')
			return ;
				const user_search_api = this.$base_url + "users/findbyuser/" + this.usernameToSearch;
				const res_user = await this.axios.get(user_search_api, {withCredentials: true });
		this.users = res_user.data;
		this.searching = false;
	},
	async retrieveNotifications() {
		this.messages = [];
		this.convos_users = [];
		this.notifications = [];
		const api = this.$base_url + 'messages/lollo/find';
			const api_messages = this.$base_url + 'messages/messages/unread'
		let res = null;
			let res_mess = null;
		try {
			res = await this.axios.get(api, {withCredentials: true});
					res_mess = await this.axios.get(api_messages, {withCredentials: true});
			this.messages = res_mess.data;
			if (res.data.length > 0) {
				this.numNotif = res.data.length;
				this.notifications = res.data;
				this.retrieveUserDetails();
				for(let i = 0; i < this.notifications.length; i++) {
					let notif = null;
					if (this.notifications[i].type == 'Message' || this.notifications[i].type == "Gif") {
						const user = await this.retrieveSingleUserDetails(this.notifications[i].user_from);
						notif = new Notification(`${user.custom_username}`, {
							body: this.notifications[i].type == "Gif" ? "GIF Message" : `${this.getLastMessageBody(user.id)}`,
							icon: `${user.avatar}`,
							data: {
								id: this.notifications[i].id,
								user: user,
							},
						});
					} else {
						let icon = null;
						if (this.notifications[i].message_id == 1)
							icon = 'achievements/first-match.png';
						else if (this.notifications[i].message_id == 2)
							icon = 'achievements/first-win.png';
						else if (this.notifications[i].message_id == 3)
							icon = 'achievements/five-wins.png';
						else if (this.notifications[i].message_id == 4)
							icon = 'achievements/third-match.png';
						notif = new Notification(`New Achievement!`, {
							body: `${this.notifications[i].body}`,
							icon: this.$base_url + icon,
							data: {
								id: this.notifications[i].id,
							},
						});
					}
					// notif.addEventListener('close', (e) => {
					// 	// e.target.data
					// 	const api_deliver_notif = this.$base_url + 'messages/notifications/read';
					// 	const data = {
					// 		"id": e.target.data.id
					// 	}
					// 	const res = this.axios.post(api_deliver_notif, data, {withCredentials: true});
					// })
					notif.addEventListener('show', (event) => { 
						// const api_deliver_notif = this.$base_url + 'messages/notifications/read';
						// const data = {
						// 	"id": event.target.data.id
						// }
						// const res = this.axios.post(api_deliver_notif, data, {withCredentials: true});
					});
					if (this.notifications[i].type == 'Message') {
						notif.onclick = (e) => {
							router.push('/singlechat?username=' + e.target.data.user.username);
							window.focus();
						}
					}
				}
			} else {
				this.numNotif = 0;
			}
		}
		catch(err) {
			console.log(err);
		}
		// console.log(res.data.length);
	},

	async retrieveSingleUserDetails(id: number) {
		// for(let i = 0; i < this.convos_users.length; i++) {
		//   if (id == this.convos_users[i].id) {
		//     return this.convos_users[i];
		//   }
		// }
		// return null;
		const user_api = this.$base_url + 'users/' + id;
	const user_res = await this.axios.get(user_api, {withCredentials: true});
		return user_res.data;
	},

	async retrieveUserDetails() {
		if (this.messages.length <= 0) 
		return ;
		const user_api = this.$base_url + 'users/' + this.messages[0].user_from;
		const user_res = await this.axios.get(user_api, {withCredentials: true});
		this.convos_users.push(user_res.data);
		// const notif = new Notification(`${user_res.data.username}`, {
		//   body: `${this.getLastMessageBody(user_res.data.id)}`,
		//   icon: `${user_res.data.avatar}`,
		//   image: `${user_res.data.avatar}`,
		//   data: {
		//     id: '100'
		//   }
		// });
		// notif.addEventListener('close', (e) => {
		//   console.log(e.target.data);
		//   // e.target.data
		// })
	},
	getNumOfSingleNotif(id) {
		const count = this.messages.filter((obj) => obj.user_from == id).length;
		return count;
	},
	getLastMessageBody(id) {
		for (let i = 0; i < this.messages.length; i++) {
			if (this.messages[i].user_from == id || this.messages[i].user_to == id) {
				return this.messages[i].body;
			}
		}
	},
	getLastMessageTime(id) {
		for (let i = 0; i < this.messages.length; i++) {
			if (this.messages[i].user_from == id) {
				let date = new Date(this.messages[i].date);
				let minutes = date.getMinutes().toString();
				if (parseInt(minutes) < 10) {
					minutes = "0" + minutes;
				}
				let hours = date.getHours().toString();
				let to_return = hours + ":" + minutes;
				return to_return;
			}
		}
	}
	},
	created() {
		SocketioService.setupSocketConnection();
	},
	mounted() {
		if(window.location.pathname == '/') {
			this.notHomepage = false;
		} else {
			this.notHomepage = true;
		}
		const perm = Notification.requestPermission();

		this.retrieveNotifications();
		setInterval(this.retrieveNotifications, 2500);
	}
	
}
</script>


<template>
<div>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;400;900&display=swap" rel="stylesheet">
	<Menubar :model="menuBar" :exact="true" v-show="notHomepage">
		<template #start>
			<RouterLink to="/">
				<img alt="Transcendence Logo" class="logo" src="@/assets/logo-joy.png" width="80" />
			</RouterLink>
		</template>
		<template #end>
			<i class="pi pi-bell mr-4 p-text-secondary p-button-outlined" style="font-size: 2rem" v-badge.danger="this.numNotif" v-tooltip.top="'You have unread messages'" v-show="this.numNotif > 0" @click="displayNotif = !displayNotif"></i>
			<i class="pi pi-bell mr-4 p-text-secondary" style="font-size: 2rem" v-badge.danger="this.numNotif" v-show="this.numNotif < 1" @click="displayNotif = !displayNotif"></i>
			<Button class="mr-2 p-button-rounded p-button-outlined minimal-icon"  icon="pi pi-search" @click="searchVisible = true;"/>
		<RouterLink to="/logout">
			<Button class="p-button-rounded p-button-outlined minimal-icon"  icon="pi pi-sign-out" />
			</RouterLink>
		</template>
	</Menubar> 

	<!-- <Dialog position="topright" v-model:visible="displayNotif" :draggable="false" >
		 <template #header>
			Notifications
		 </template>
	</Dialog>  -->

<Sidebar v-model:visible="displayNotif" position="right">
	<div class="col-12" style="border-radius: 3px;" v-for="user in convos_users">
		<RouterLink v-bind:to="this.$base_url + 'singlechat?username=' + user.username">
			<div class="grid">
				<div class="sm:col-12 md:col-12 lg:col-12"  style="padding-top: 10px; margin: 0; ">
					<!-- <div class="col-offset-4 col-8">
						<hr>
					</div> -->
						<div class="grid">
							<div class="col-4" style="text-align: center;">
								<img :src="user.avatar" class="single-profile-image" style="" />
							</div>
							<div class="col-6" style="margin-top: 15px;">
								<div class="col-6">
									<h2 style="color: black; font-size: 14px; text-align: left;">{{user.custom_username}}</h2>
								</div>
								<div class="col-6">
									<h3 v-html="this.getLastMessageBody(user.id)"></h3>
								</div>
							</div>
							<div class="col-2" style="margin-top: 15px;">
								<div class="col-12">
									<h2 style="font-weight: 400; font-size: 14px; text-align: left; color: black;">{{this.getLastMessageTime(user.id)}}</h2>
								</div>
									<Badge :value="this.getNumOfSingleNotif(user.id)" v-show="this.getNumOfSingleNotif(user.id) > 0" style="margin-left: 13px;"></Badge>
							</div>
						</div>
				</div>
			</div>
		</RouterLink>
	</div>
	<div v-if="convos_users.length == 0">
		No new messages
	</div>
</Sidebar>

<Sidebar v-model:visible="searchVisible" position="full" class="global-overlay">
	<div class="flex align-items-center justify-content-center flex-wrap card-container yellow-container" style="min-height: 200px">
			<div class="flex align-items-center justify-content-center font-bold text-gray-900 border-round m-2" style="min-width: 200px; min-height: 50px">
				<span class="p-input-icon-left p-input-icon-right">
						<i class="pi pi-search" />
						<InputText type="text" v-model="usernameToSearch" v-on:input="retrieveUsers" placeholder="Enter username" class="search-bar"/>
						<i class="pi pi-spin pi-spinner" v-show="searching" />
				</span>
				<!-- <Button icon="pi pi-search" class="mr-2 p-button-rounded p-button-outlined" v-tooltip="'Search Users'" @click="retrieveUsers" />-->
			</div>
	</div>
	<div class="flex align-items-center justify-content-center flex-wrap card-container yellow-container" style="min-height: 200px">
		<!--<div v-for="user in users" class="flex align-items-center font-bold text-gray-900 border-round m-2 single-user-chip" style="">
			<div style="padding: 10px;">
				<RouterLink v-bind:to="{ path: '/users/' + user.username}" @click="searchVisible = !searchVisible">
					<Avatar v-bind:image="user.avatar" shape="circle" />
				</RouterLink>
			</div>
			<RouterLink v-bind:to="{ path: '/users/' + user.username}" @click="searchVisible = !searchVisible">
				<p style="margin-left:20px; color: white;">{{user.custom_username != null ? user.custom_username : user.username}}</p>
			</RouterLink>
		</div> -->
		<div v-for:for="user in users">
			<RouterLink v-bind:to="{ path: '/users/' + user.username}" @click="searchVisible = !searchVisible">
			 <Chip v-bind:label="user.custom_username" v-bind:image="user.avatar" class="custom-chip" />
			</RouterLink>
		</div>
		<div v-if="users.length == 0">
			<p style="color: white; font-size: 14px;">No user found</p>
		</div>
	</div>
</Sidebar>
	<!-- <div class="navbar" style="padding: 20px 10px;">
		<div class="grid">
			<div class="col-4">
				<RouterLink to="/">
					<img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="50" height="50" />
				</RouterLink>
			</div>
			<div class="col-4">
				<p>Inside first column</p>
			</div>
			<div class="col-4">
				<p>Inside first column</p>
			</div>
		</div>
	</div> -->
	<main style="width: 100%;">
<!--     <RouterView v-slot="{ Component }">
			<transition name="route" mode="out-in">
				<component :is="Component"></component>
			</transition>
		</RouterView> -->

		<RouterView />

	<!--<router-view v-slot="{ Component }">
			<transition name="route" mode="out-in">
				<component :is="Component" />
			</transition>
		</router-view> -->
	</main>
</div>
</template>


<style lang="scss">
@import "./assets/styles/layout.scss";

body {
	background: black;
}

.minimal-icon {
	color: black !important;
}

.minimal-icon > span {
	color: black;
}

.global-overlay {
	background: black;
}

.search-bar {
	background: transparent;
	border: none;
	border-bottom: 1px solid white;
	border-radius: 0px;
}

.search-bar:focus {
	color: white;
	border: none;
	outline: none !important;

}

.router-enter-from {
	opacity: 0;
	transform: translateX(100px);
}

.router-enter-active {
	transition: all 0.3s ease-out;
}

.router-leave-to {
	opacity: 0;
		transform: translateX(-100px);
}

.router-leave-active {
	transition: all 0.3s ease-out;
}

.single-user-chip {
	min-width: 200px;
	min-height: 50px;
	// background: darkorange;
	border: 1px solid white;
}

.custom-chip {
	background: white;
}

.p-dialog-topright {
	top: 5% !important;
}


h2 {
	font-size: 14px;
	color: black;
	text-align: left;
	font-weight: 600;
}

h3 {
	font-size: 12px;
	text-align: left;
	color: black;
}

.single-profile-image {
	width: 3.3rem;
	height: 3.3rem;
	border-radius: 50%;
	margin-top: 30px;
}

</style>
