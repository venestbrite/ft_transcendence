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

export default {
    data() {
        return {
			ladder_users: [],
			counter: 0,
        }
    },
    methods: {
        async get_ladder()
        {
			const api = this.$base_url + "users/find/ladder";
			const res = await this.axios.get(api, {withCredentials: true});

			this.ladder_users = res.data;

			for(let i = 0; i < res.data.length; i++) {
				this.ladder_users[i].index = i;
			}
		},
		goToUser(username: string) {
			if (!username)
				return ;
			router.push(`/users/${username}`);
		},
		displayCounter() {
			this.counter++;
			return this.counter - 500;
		}
    },
    created() {
        this.get_ladder();
    }
}
</script>

<template>
<div class="flex align-items-center justify-content-center" style="padding: 30px;">
	<div class="lg:col-4 md:col-12 sm:col-12">
		<div class="grid white-text" style="width: 100%;">
			<div class="col-4">
				<p>Rank</p>
			</div>
			<div class="col-4">
				<p>Username</p>
			</div>
			<div class="col-4">
				<p>Wins</p>
			</div>
		</div>
	</div>
</div>
<div class="flex align-items-center justify-content-center" style="">
	<div class="lg:col-4 sm:col-12">
		<div class="card custom-card"  style="cursor: pointer; min-width: 400px; max-width: 800px;" v-for="user in ladder_users"> <!-- v-for="friend in friends" -->
			<div class="grid align-items-center text-center" style="margin-top: 5px; width: 100%;" @click="goToUser(user.username)">
				<div class="col-4" v-if="user.index < 3">
					<Avatar v-badge.danger="user.index + 1" v-bind:image="user.avatar" shape="circle" size="xlarge" />
				</div>
				<div class="col-4" v-else>
					<Avatar v-bind:image="user.avatar" shape="circle" size="xlarge" />
				</div>
				<div class="col-4">
					<p>{{user.custom_username != null ? user.custom_username : user.username}}</p>
				</div>
				<div class="col-4">
					<p>{{user.num_wins}}</p>
				</div>
			
			</div>
		</div>
	</div>

</div> 

</template>

<style lang="scss">
body {
    // background: linear-gradient(#F72585, #B5179E, #7209B7);
	background-image: linear-gradient(to bottom, #434343 0%, black 100%);
}

.custom-card {
	border-radius: 3px !important;
	color: black !important;
}

.custom-card p {
	color: black;
}

.white-text p {
	color: white;
}


</style>