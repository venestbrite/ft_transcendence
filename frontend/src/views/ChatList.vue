<script lang="ts">
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
import router from "@/router";
import Sidebar from 'primevue/sidebar';


export default {
    data() {
        return {
			user: {},
			achievements: [],
			avatar: '',
			conversations_text: 'you have no active conversations',
			avatars_html: '',
			convos_users: [], 
			messages: null,
			unread: [],
			visibleLeft: true,
        }
    },
    methods: {
        async get_chats()
        {
            const api = this.$base_url + 'users/me';
			let result = null;
            try {
				result = await this.axios.get(api, { withCredentials: true });
			}
			catch(err) {
				window.location.href = '/login';
			}

            this.user = result.data;
            this.avatar = result.data.avatar;
			this.achievements = result.data.achievements;

			let convos = [];

			const api_messages = this.$base_url + 'messages/users/' + this.user.id;
			const res_messages = await this.axios.get(api_messages, { withCredentials: true });

			this.messages = res_messages.data;

			let user_to_push;

			for(let index = 0; index < res_messages.data.length; index++) {
				if (res_messages.data[index].user_from == this.user.id)
					user_to_push = res_messages.data[index].user_to;
				else
					user_to_push = res_messages.data[index].user_from;
				if (!convos.includes(user_to_push))
					convos.push(user_to_push);
			}

			if (convos.length > 0) {
				this.conversations_text = 'You have conversations with: ';
				for(let i = 0; i < convos.length; i++) {
					const user_api = this.$base_url + 'users/' + convos[i];
					const user_res = await this.axios.get(user_api, {withCredentials: true});

					this.conversations_text += user_res.data.username + ' ';

					// this.avatars_html += `<img src='${user_res.data[0].avatar}' style='width: 100px;'/>`;

					let singlechat_link = `/singlechat?username=${user_res.data.username}`;

					this.avatars_html += `<a href='${singlechat_link}'>${user_res.data.username}</a>`;
					if (!this.convos_users.includes(user_res.data))
						this.convos_users.push(user_res.data);
				}
			}
			this.retrieveNotifications();

        },
		getUsername(id) {
			for (let i = 0; i < this.convos_users.length; i++) {
				if (this.convos_users[i].id == id) {
					return this.convos_users[i].custom_username;
				}
			}
			return null;
		},
		getNumOfSingleNotif(id) {
			const count = this.unread.filter((obj) => obj.user_from == id).length;
			return count;
		},
		retrieveNotifications() {
			this.unread = [];
			for(let i = 0; i < this.messages.length; i++) {
				// console.log(this.messages[i]);
				if (!this.messages[i].read) {
					this.unread.push(this.messages[i]);
				}
			}	
			
		},
		getLastMessageBody(id) {
			for (let i = 0; i < this.messages.length; i++) {
				if (this.messages[i].user_from == id || this.messages[i].user_to == id) {
					if (this.messages[i].gif && this.messages[i].user_to == this.user.id) {
						return 'Sent you a GIF';
					}
					else if (this.messages[i].gif && this.messages[i].user_to != this.user.id)
						return 'You sent a GIF';
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
        this.get_chats();
    }
}
</script>
<template>
<div>
<div class="bg"></div>
<div class="bg bg2"></div>
<div class="bg bg3"></div>

<!-- <div class="grid" style="margin-top: 80px;">
	<div class="wrapper lg:col-6 lg:col-offset-3 sm:col-12 users-wrapper" style="background: white;">
		<div class="grid">
			<div class="col-3 chat-single-wrapper" v-for="user in convos_users" style="text-align: center;">
		<RouterLink v-bind:to="this.$base_url + 'singlechat?username=' + user.username">
				<Avatar v-bind:image="user.avatar" shape="circle" size="xlarge" style="border: 2px solid lightgreen;" v-show="this.getNumOfSingleNotif(user.id) > 0" v-badge.danger="this.getNumOfSingleNotif(user.id)"/>
				<Avatar v-bind:image="user.avatar" shape="circle" size="xlarge" style="border: 2px solid lightgreen;" v-show="this.getNumOfSingleNotif(user.id) == 0"/>
				<p class="username-chat" style="color: black;">{{user.custom_username == null ? user.username : user.custom_username}}</p>
		</RouterLink>
			</div>
		
		</div>
		<div v-if="convos_users.length < 1" style="padding:20px;">You have no active conversations</div>
	</div>



</div> -->
				<!-- <img src="https://cdn.intra.42.fr/users/stribuzi.jpg" style="width: 80px;"> -->
<!-- 
<Sidebar v-model:visible="visibleLeft" position="right" >
	<div class="col-12" style="border-radius: 3px;" v-for="user in convos_users">
		<RouterLink v-bind:to="this.$base_url + 'singlechat?username=' + user.username">
			<div class="grid">
				<div class="sm:col-12 md:col-12 lg:col-12"  style="padding-top: 10px; margin: 0; ">
						<div class="grid">
							<div class="col-4" style="text-align: center;">
								<img :src="user.avatar" class="single-profile-image" style="" />
							</div>
							<div class="col-6" style="margin-top: 15px;">
								<div class="col-6">
									<h2>{{user.custom_username}}</h2>
								</div>
								<div class="col-6">
									<h3>{{this.getLastMessageBody(user.id)}}</h3>
								</div>
							</div>
							<div class="col-2" style="margin-top: 15px;">
								<div class="col-12">
									<h2 style="font-weight: 400;">{{this.getLastMessageTime(user.id)}}</h2>
								</div>
									<Badge :value="this.getNumOfSingleNotif(user.id)" v-show="this.getNumOfSingleNotif(user.id) > 0" style="margin-left: 13px;"></Badge>
							</div>
						</div>
				</div>
			</div>
		</RouterLink>
	</div>
</Sidebar> -->
<div class="grid grid-nogutter flex align-items-center justify-content-center" style="padding: 30px;">
    <div class="card sm:col-12 md:col-6 lg:col-4" >
        <div class="" style="border-radius: 3px;" v-for="user in convos_users">
			<RouterLink v-bind:to="this.$base_url + 'singlechat?username=' + user.username">
				<div class="grid">
					<div class="sm:col-12 md:col-12 lg:col-12"  style="padding-top: 10px; margin: 0; ">
						<div class="col-offset-4 col-8">
							<hr>
						</div>
							<div class="grid">
								<div class="col-4" style="text-align: center;">
									<img :src="user.avatar" class="single-profile-image" style="" />
								</div>
								<div class="col-6" style="margin-top: 15px;">
									<div class="col-6">
										<h2>{{user.custom_username}}</h2>
									</div>
									<div class="col-6">
										<!-- <h3>{{this.getLastMessageBody(user.id)}}</h3> -->
										<h3 v-html="this.getLastMessageBody(user.id)"></h3>
									</div>
								</div>
								<div class="col-2" style="margin-top: 15px;">
									<div class="col-12">
										<h2 style="font-weight: 400;">{{this.getLastMessageTime(user.id)}}</h2>
									</div>
										<Badge :value="this.getNumOfSingleNotif(user.id)" v-show="this.getNumOfSingleNotif(user.id) > 0" style="margin-left: 13px;"></Badge>
								</div>
							</div>
					</div>
				</div>
			</RouterLink>
        </div>
		<div v-if="convos_users.length == 0">
			<p style="color: black; padding: 30px;">No active conversations</p>
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

.wrapper {
	border-radius: 10px; 
}

.chat-single-wrapper {
	cursor: pointer;
}

.username-chat {
	font-size: 15px;
	margin-top: 5px;
}

@media(max-width: 767px) {
	.users-wrapper {
		width: 80% !important;
    	margin: 30px !important;
	}
}

.bg {
  animation:slide 3s ease-in-out infinite alternate;
  background-image: linear-gradient(-60deg, rgb(0, 0, 0) 50%, rgb(112, 112, 112) 50%);
  bottom:0;
  left:-50%;
  opacity:.5;
  position:fixed;
  right:-50%;
  top:0;
  z-index:-1;
// background-image: linear-gradient(to bottom, #434343 0%, black 100%);
}

.bg2 {
  animation-direction:alternate-reverse;
  animation-duration:4s;
}

.bg3 {
  animation-duration:5s;
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