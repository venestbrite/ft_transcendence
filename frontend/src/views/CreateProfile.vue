<script lang="ts">
import router from '@/router';
import { defineComponent, reactive } from "vue";
import {createApp} from 'vue';
import PrimeVue from 'primevue/config';
import {PrimeIcons} from 'primevue/api';
import Button from 'primevue/button';
import axios from 'axios';
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import Steps from 'primevue/steps';
import Checkbox from 'primevue/checkbox';
import { useToast } from "primevue/usetoast";
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';

// function goToLogin() {
// 	window.location.href = "http://localhost:5050/auth/api42";
// }

export default {
  data() {
	return {
    	user: {},
		newUsername: '',
		checked: false,
	}
  },
  methods: {
    goToLogin() { 
    	window.location.href = this.$base_url + 'auth/api42';
    },
	onUpload() {
    	this.$toast.add({severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000});
    },
    async findUser() {
		const api = this.$base_url + 'users/me';
		let result = null;
		if (!this.$userLoggedIn) {
			try {
				result = await this.axios.get(api, { withCredentials: true });
				this.$userLoggedIn = result.data;
				this.user = result.data;
			}
			catch(err) {
				// router.push('/login');
				console.log(err);
				return ;
			}
		}
		else {
			result = this.$userLoggedIn;
			this.user = this.$userLoggedIn;
		}
		if (!this.user.is_first_login)
			router.push('/profile');
    },
	async myUploader(event) { //event.files == files to upload
		const api = this.$base_url + 'users/avatar/' + this.user.username;
		const data = {
			"avatar": event.files[0]
		}
		let formData = new FormData();
		formData.append('avatar', event.files[0]);
		// You should have a server side REST API 
		const res = await axios.post(api,
			formData, {
				headers: {
				'Content-Type': 'multipart/form-data'
				},
				withCredentials: true,
			}
		)
		this.$toast.add({severity:'success', summary: 'Picture Uploaded', detail:'Correctly changed your profile pic', life: 3000});
		// window.location.href = '/profile';
	},
	async updateInfos() {

		if (this.newUsername == '') {
			this.$toast.add({severity:'error', summary: 'Username is empty', detail:'Please select a valid username', life: 3000});
			return ;
		}
		const api = `${this.$base_url}users/${this.user.id}/change-username`;
		const res = await this.axios.patch(api, {username: this.newUsername, is_first_login: false}, {withCredentials: true});

		if (res.data === 'approved') {
			this.$toast.add({severity:'success', summary: 'Profile completed!', detail:'You will be redirected shortly', life: 3000});
			setTimeout(() => {
				router.push('/profile');
			}, 2000);
			
		}
		else
			this.$toast.add({severity:'error', summary: 'General Error', detail:'Something went wrong, please try again', life: 3000});
	}
  },
  created() {
		this.findUser();
  },
  mounted() {
	  
  },
}


</script>

<template>
<div>
	<Toast position="bottom-right" />
	<!-- <div class="grid grid-nogutter flex align-items-center justify-content-center" style="padding: 30px;">
		<div class="md:col-6 lg:col-4 sm:col-12 " >
			<div class="flex align-items-center text-center justify-content-center flex-wrap card-container">
				<div class="card my-card">
					<div class="grid flex align-items-center justify-content-center" >
						<div class="md:col-4 lg:col-12 sm:col-12 "  style="padding-top: 60px;">
							<div  class="col-6 username"> 
								<h1 style="color: black; font-size: 25px;">INSERT YOUR INFO</h1>
							</div>
							<span class="p-input-icon-left">
								<i class="pi pi-user" />
								<InputText type="text" v-model="newUsername" placeholder="Username" />
							</span>
						</div>
						<div class="md:col-4 lg:col-12 sm:col-12 "  style="padding-bottom: 20px;">
							<Checkbox inputId="binary" v-model="checked" :binary="true" />
							<label> Update your image?</label>
						</div>
						<div class="md:col-4 lg:col-12 sm:col-12 "  style="padding-bottom: 35px;" v-show="checked">
							<FileUpload name="demo[]" mode="basic" chooseLabel="Change Image" chooseIcon="pi pi-upload" :customUpload="true" @uploader="myUploader" :auto="true" />
						</div>
					</div>
					<div class="md:col-4 lg:col-12 sm:col-12 "  style="">
						<Button label="Complete profile" class="p-button-raised p-button-success" icon="pi pi-check" @click="updateInfos"/>
					</div>
				</div>
			</div>
		</div>
	</div> -->

	<div class="card main-form" style="width: 400px;">
		<div class="flex justify-content-center flex-wrap card-container yellow-container pt-2">
			<div class="flex align-items-center justify-content-center font-bold text-gray-900 border-round m-2" style="padding-top:20px;">
				<div> 
					<p style="color: black; font-size: 25px;">Complete Profile</p>
				</div>
			</div>
		</div>
		<div class="flex justify-content-center flex-wrap card-container yellow-container pt-2">
			<div class="flex align-items-center justify-content-center font-bold text-gray-900 border-round m-2">
				<div> 
					<span class="p-input-icon-left">
						<i class="pi pi-user" />
						<InputText type="text" v-model="newUsername" placeholder="Username" />
					</span>
				</div>
			</div>
		</div>
		<div class="flex justify-content-center flex-wrap card-container yellow-container pt-2">
			<div class="flex align-items-center justify-content-center font-bold text-gray-900 border-round m-2">
				<div> 
					<Checkbox inputId="binary" v-model="checked" :binary="true" />
					<label> Update your image?</label>
				</div>
			</div>
		</div>
		<div class="flex justify-content-center flex-wrap card-container yellow-container pt-2" v-if="checked">
			<div class="flex align-items-center justify-content-center font-bold text-gray-900 border-round m-2">
				<div>
					<FileUpload name="demo[]" mode="basic" chooseLabel="Upload Image" chooseIcon="pi pi-upload" :customUpload="true" @uploader="myUploader" :auto="true" />
				</div>
			</div>
		</div>
		<div class="flex justify-content-center flex-wrap card-container yellow-container pt-2" style="padding-bottom: 40px;">
			<div class="flex align-items-center justify-content-center font-bold text-gray-900 border-round m-2">
				<div>
					<Button label="Complete profile" class="p-button-raised p-button-success" icon="pi pi-check" @click="updateInfos"/>
				</div>
			</div>
		</div>
	</div>
</div>
		
</template>

<style lang="scss">
	.card {
    padding: 0 !important;
}
.my-card {
	margin-top: 70px;
    width: 100%;
    border-radius: 10px;
    box-shadow: 0 10px 25px 5px rgba(0, 0, 0, 0.2);
    background: white;
    overflow: hidden;

	.username {
		width: inherit;
		text-align: center;
		animation: fadeIn 2s ease-in;
		p {
			padding: 5px 20px;
			border-radius: 10px;
			color: black;
			letter-spacing: 0.05em;
			text-decoration: none;
			font-size: 20px;
			transition: all 1s;
			&:hover {
				color: white;
				background: #06cc1d;
			}
		}
	}
}

.main-form {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%); 
}

.pt-2 {
	padding-top: 40px;
}
</style>