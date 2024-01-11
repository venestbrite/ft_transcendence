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
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';     //optional for column grouping
import Row from 'primevue/row';                     //optional for row
import Dropdown from 'primevue/dropdown';
import CheckBox from 'primevue/checkbox';
import Password from 'primevue/password';

export default {
    data() {
        return {
			user: {},
			channels: [],
			columns: [
            	{field: 'title', header: 'Title'},
            	{field: 'private', header: 'Private'},
            	{field: 'created', header: 'Created'},
            	{field: 'members', header: 'Members'},
				{field: 'password_protected', header: 'Password Required'}
        	],
			displayModal: false,
			selectedPwd: false,
			channelPassword: null,
			selectedPrivate: false,
			channelTitle: '',
			cities: [
				{name: 'Yes', code: 'NY'},
			],
			loading: false,
			channelCreated: false,
			formShow: true,
        }
    },
    methods: {
        async get_chats()
        {
            const api = this.$base_url + 'channels';
            const result = await this.axios.get(api, { withCredentials: true });
            this.channels = result.data;



        },
		async createNewChannel() {
			this.channelTitle = this.channelTitle.trim();
			if (this.channelTitle == '') {
				this.$toast.add({severity: 'error', summary: 'Error', detail: 'Title cannot be empty', life: 3000});
				return ;
			}
			const api = this.$base_url + 'channels/new_channel';
			const data = {
				"title": this.channelTitle,
				"password": this.channelPassword,
				"password_protected": this.selectedPwd,
				"is_private": this.selectedPrivate
			}
			const res = await this.axios.post(api, data, {withCredentials: true});
			this.loading = true;
			this.formShow = false;
			if (res.data == 'OK')
			{
				this.loading = false;
				this.channelCreated = true;
				this.channelTitle = '';
				this.selectedPwd = false;
				this.channelPassword = null;
				
				this.$toast.add({severity: 'success', summary: 'Success', detail: 'Channel Created', life: 3000});
				this.get_chats();
			}
			else if (res.data == 'NOT UNIQUE') {
				this.loading = false;
				this.formShow = false;
				this.$toast.add({severity: 'error', summary: 'Error', detail: 'Title already in use', life: 3000});
			} else {
				this.loading = false;
				this.formShow = false;
				this.$toast.add({severity: 'error', summary: 'Error', detail: 'Something went wrong', life: 3000});
			}
			this.toggle();
		},
		toggle() {
			this.displayModal = !this.displayModal;
		},
		testCreate() {

			alert(this.selectedPwd); // this.selectedPwd this.channelTitle this.channelPassword
			this.loading = true;
			this.formShow = false;
			setTimeout(() => {
				this.loading = false;
				this.channelCreated = true;
			}, 2000);
		},
		resetModal() {
			this.formShow = true;
			this.loading = false;
			this.channelCreated = false;
		}
    },
    created() {
        this.get_chats();
    }
}
</script>
<template>
<div class="grid">
	<Toast position="top-right" />
	<div class="lg:col-6 lg:col-offset-3 sm:col-12">
 		<DataTable :value="channels" responsiveLayout="scroll">
		<template #header>
			<div>
				Channel List
			</div>
		</template>
            <Column v-for="col of columns" :field="col.field" :header="col.header" :key="col.field"></Column>
			 <Column field="link" header="Join">
				<template #body="{data}">
					<!-- <a v-bind:href="data.link"><i class="pi pi-user-plus"></i></a> -->
					<router-link :to="data.link"><i class="pi pi-user-plus"></i></router-link>
				</template>
            </Column>
        </DataTable>
	</div>
</div>
<div class="grid">
	<div class="lg:col-6 lg:col-offset-3 sm:col-12">
	<Button type="button" icon="pi pi-plus" class="p-button-rounded p-button-outlined white" @click="toggle" />
	</div>
</div>

<Dialog header="Create new Channel" v-model:visible="displayModal" :style="{width: '50vw'}" class="new-channel-modal" :modal="true" :hide="resetModal">
	
		<div class="grid align-content-center justify-content-center">
			<div class="col-12">
				<div style="padding: 10px;">
					<InputText type="text" class="full-w" v-model="channelTitle" placeholder="Enter Channel Title..." />
				</div>
				<div style="padding: 10px;">
					<Checkbox id="binary" v-model="selectedPwd" :binary="true" />
					<label for="binary" style="margin-left: 10px;" v-tooltip="'Users will have to enter a password to join.'">Password <a href='#'>protected?</a></label>
				</div>
				<div style="padding: 10px;" v-if="selectedPwd">
					<Password v-model="channelPassword" placeholder="Enter password..." class="full-w" toggleMask></Password>
				</div>
				<div style="padding: 10px;">
					<Checkbox id="binary" v-model="selectedPrivate" :binary="true" />
					<label for="binary" style="margin-left: 10px;" v-tooltip="'Only invited users will be able to join.'">Make it <a href='#'>private?</a></label>
				</div>
			</div>
			<div class="col-12" style="text-align: center;" v-if="loading">
				<i class="pi pi-spin pi-spinner" style="font-size: 10rem; background: purple; color: white; padding: 20px; border-radius: 100%;"></i>
			</div>
			<!-- <div class="col-12" style="text-align: center;" v-if="channelCreated">
				<i class="pi pi-check" style="font-size: 10rem; background: purple; color: white; padding: 20px; border-radius: 100%;"></i>
			</div> -->
			<div class="col-12">
				<Button label="Create Channel" class="p-button-rounded p-button-outlined minimal-icon new-channel full-w" @click="createNewChannel" autofocus />
			</div>
		</div>
			<template #footer>
				<!-- <Button label="No" icon="pi pi-times" @click="closeModal" class="p-button-text"/> -->
			</template>
</Dialog>


</template>

<style lang="scss">
body {
   // background: linear-gradient(#F72585, #B5179E, #7209B7);
   background-image: linear-gradient(to bottom, #434343 0%, black 100%);
}

.input {
	width: 100%;
	padding: 30px 20px !important;
	font-size: 1.3rem;
	border: none;
	border-bottom: 1px solid lightgrey;
	-webkit-transition: border .35s ease-in-out;
 	 transition: border .35s ease-in-out;
}

.input:focus {
	outline: none;
	border: 1px solid black; 
}

.white {
	color: white !important;
}
.white span {
	color: white;
}

.new-channel {
	border-radius: 3px !important;
}

.new-channel-modal {
	max-width: 450px;
}

.full-w {
	width: 100%;
}




</style>