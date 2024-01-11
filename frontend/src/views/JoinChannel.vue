<script>
import InputText from 'primevue/inputtext';
import router from '@/router';

export default {
	data() {
		return {
			user: {},
			password_req: false,
			password: '',
			error_txt: '',
			channel: null,
			success_msg: '',
		}
	},
	methods: {
		async joinChannel() {
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			const id = urlParams.get('id');

			if (!id) {
				router.push('/channels');
				return ;
			}

			/******************     TO CHANGE THIS PART  (USE THE GUARDS TO RETRIEVE THE USER! ****************/
	
			const api_user = this.$base_url + 'users/me';
			const res_user = await this.axios.get(api_user, { withCredentials: true});
			this.user = res_user.data;


			/***************** ***************** ***************** ***************** ***************** ***************** */

			const api = this.$base_url + 'channels/id/';
			const res = await this.axios.get(api + id, { withCredentials: true});
			this.channel = res.data; // TO DO CHECK IF RESPONSE HAS SENSE
			if (this.channel.password_protected) {
				this.password_req = true;
				const api_check_user = this.$base_url + `channels/check/${id}`;
				const res = await this.axios.get(api_check_user, {withCredentials: true});
				if (res.data) {
					router.push('/single-channel?id=' + id);
					return ;
				}
			}
			else if (res.data == '') {
				router.push('/channels');
			}
			/* else if (res.data.private) { //

				let api_inside = this.$base_url + "/channels/singlechannel/is-user-member"
				router.push('/channels');
			} */
			else {
				router.push('/single-channel?id=' + id);
			}
		},
		async verifyPassword() {
			const api = this.$base_url + 'channels/join/private';
			const data = {
				"password": this.password,
				"channel_id": this.channel.id.toString(),
			}
			const res = await this.axios.post(api, data, { withCredentials: true });
			if (res.data == 'wrong password' || res.data == 'failed')
				this.error_txt = 'Wrong Password, try again.';
			else {
				this.success_msg = 'Correctly added to channel!';
				setTimeout(() => {
					router.push('/single-channel?id=' + this.channel.id);
				}, 1500);
			}
		}
	},
	created() {
		if (this.$router.options.history.state.forward) {
			this.$router.push('/channels');
		}
	},
	mounted() {
		this.joinChannel();
	}
}


</script>


<template>

<div class="card" v-if="password_req">
	<div class="flex align-items-center text-center justify-content-center flex-wrap card-container">
		<div class="col-12">
			<p class="text-3xl">Password Required</p>
		</div>
		<div class="col-12">
			<Password v-model="password" placeholder="Insert Password" :feedback="false" toggleMask/>
			<Button @click="verifyPassword" icon="pi pi-check" iconPos="right" class="p-button-outlined" />
		</div>
		<div class="col-12">
			<p style="color: red;">{{this.error_txt}}</p>
		</div>
		<div class="col-12">
			<p style="color: lightgreen;">{{this.success_msg}}</p>
		</div>
	</div>
</div>



	
</template>

<style>
	
</style>