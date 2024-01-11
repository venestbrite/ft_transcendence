<script lang="ts">
import router from '@/router';
import { defineComponent, reactive } from "vue";
import {createApp} from 'vue';
import PrimeVue from 'primevue/config';
import {PrimeIcons} from 'primevue/api';
import Button from 'primevue/button';
// function goToLogin() {
// 	window.location.href = "http://localhost:5050/auth/api42";
// }

export default {
  data() {

  },
  methods: {
    goToLogin() { 
      window.location.href = this.$base_url + 'auth/api42';
    }
  },
}


</script>

<template>
 <div class="test-btn">
  <Button @click="goToLogin()" label="Login with 42" style="font-size: 2rem"/>
 </div>
</template>

<style>
*  > button{
  cursor: pointer;
  width: 300px;
}
.test-btn {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>