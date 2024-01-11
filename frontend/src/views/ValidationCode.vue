<script>
import { defineComponent, reactive } from "vue";
import {createApp} from 'vue';
import PrimeVue from 'primevue/config';
import {PrimeIcons} from 'primevue/api';
import InputSwitch from 'primevue/inputswitch';
import InputMask from 'primevue/inputmask';
import Button from 'primevue/button';

export default {
	data() {
		return {
			code: '',
			error_txt: ''
		}
	},
	methods: {
		verify_code() {
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			const username = urlParams.get('username');

			const api = this.$base_url + 'auth/verify-login-2fa';
			const code_to_send = this.code;
			this.axios.get(api + '?username=' + username + '&code=' + code_to_send, { withCredentials: true }).then((response) => {
				if (response.data == 'approved') {
					window.location.href = '/profile';
				}
				else
					this.error_txt = 'Wrong code, try again.';
			})
		}
	},
	mounted() {
		document.addEventListener('keypress', (ev) => {
			if (ev.key == 'Enter') {
				this.verify_code();
			}
		})
	}
}


</script>


<template>
	<div class="flex align-items-center text-center justify-content-center flex-wrap card-container centered">
		<div class="col-12">
			<p class="text-3xl">Two Factor Authentication Required</p>
		</div>
		<div class="col-12">
			<InputMask v-model="code" mask="999999" placeholder="Insert validation code" />
			<Button @click="verify_code" icon="pi pi-check" iconPos="right" class="p-button-outlined custom-icon" />
		</div>
		<div class="col-12">
			<p style="color: red;">{{this.error_txt}}</p>
		</div>
	</div>
</template>

<style lang="scss">

.centered {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.custom-icon {
	border: 1px solid white !important;
}

.custom-icon span {
	color: white;
}

</style>
