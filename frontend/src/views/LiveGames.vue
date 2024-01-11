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
			live_games_ids: [],
            live_games_objs: [],
			live_games_obj_total: [],
			counter: 0,
        }
    },
    methods: {
        async get_live_games()
        {
			const api = this.$base_url + "games/find/live";
			const res = await this.axios.get(api, {withCredentials: true});

			this.live_games_ids = res.data;

			// console.log(res);
			const api_single_game = this.$base_url + "games/find/singlelive/";
			for (let i = 0; i < this.live_games_ids.length; i++) {
				const res = await this.axios.get(api_single_game + this.live_games_ids[i]);
				const game = res.data[0];
				this.live_games_objs.push(game);
			}


			const api_single_user = this.$base_url + "users/";
			for (let i = 0; i < this.live_games_objs.length; i++) {
				let res = await this.axios.get(api_single_user + this.live_games_objs[i].user_1_id);
				const player_1 = res.data;
				res = await this.axios.get(api_single_user + this.live_games_objs[i].user_2_id);
				const player_2 = res.data;

				let obj = {
					"player_1": player_1,
					"player_2": player_2,
					"game_id": this.live_games_ids[i]
				}

				this.live_games_obj_total.push(obj);
			}

			
		}
    },
    created() {
        this.get_live_games();
    }
}
</script>

<template>
<div class="grid grid-nogutter flex align-items-center justify-content-center" style="padding: 30px;">
	<div class="col-4 col-offset-1">
	<div class="card"  style="cursor: pointer; min-width: 400px; max-width: 600px;" v-for="game in live_games_obj_total" :id="this.counter++"> <!-- v-for="friend in friends" -->
		<div class="grid align-items-center text-center" style="margin-top: 5px; width: 100%;">
			<div class="col-4">
				<!-- <Avatar v-bind:image="user.avatar" shape="circle" size="xlarge" /> -->
                {{ game.player_1.username }}
			</div>
			<div class="col-4">
				{{ game.player_2.username }}
			</div>
			<div class="col-4">
				<RouterLink v-bind:to=" '/view-game?game_id=' + game.game_id" >
                    Go to Game
                </RouterLink>
			</div>
		</div>
	</div>
	<p v-if="live_games_obj_total.length == 0" style="color: white; font-size: 30px;">No live games right now 😕</p>
	</div>

</div> 

</template>

<style lang="scss">
body {
   background-image: linear-gradient(to bottom, #434343 0%, black 100%);
}


</style>