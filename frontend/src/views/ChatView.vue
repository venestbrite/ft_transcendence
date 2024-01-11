<script setup lang="ts">
import { defineComponent, reactive, onBeforeMount } from "vue";
import { useAppStore } from "@/stores/app";
import SideBar from "@/components/commons/SideBar/SideBar.vue";
import { ref } from 'vue';

const visible = true;

// let chats = [];

// onBeforeMount(() => {
//     axios.get("/chats")
//     .then(response => {
//         chats = response.data
//     })
// })

</script>


<template>
  <div style="width: 100%; display: flex;">
    <SideBar />
  </div>
</template>

