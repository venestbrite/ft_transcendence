<script>

import io from 'socket.io-client'
import InputText from 'primevue/inputtext'
import socketioService from '../service/socketio.service'

export default {
	data() {
		return {
            socket: {},
            messages: '',
            message_to_send: '',
            id_to_send: '',
		}
	},
	methods: {
        joinRoom() {
            this.socket.emit('join-room', { name: 'squack', password: '' });
        },
        sendMessage() {
            this.socket.emit('send-message', { room: 'squack', body: this.message_to_send });
            this.message_to_send = '';
        },
        sendPrivateMessage() {
            this.socket.emit('send-private-message', { room: this.id_to_send, body: this.message_to_send });
            this.message_to_send = '';

        }
    },
    created() {
        this.socket = socketioService.getSocket();
        console.log(this.socket.id);
        this.socket.id = '1234';
        console.log(this.socket.id);
		this.socket.on('send-message', (room) => {
            this.messages += room;
            console.log(room);
        });
        this.socket.on('private-message', (body) => {
            this.messages += body;
            console.log(body);
        })
    },
	mounted() {
	}
}


</script>


<template>

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
</head>
<body id="body">

	<button @click="joinRoom">JOIN</button>
   <InputText v-model="message_to_send" placeholder="Insert message" />
   <InputText v-model="id_to_send" placeholder="Insert id" />

    <button @click="sendMessage">SEND MESSAGE</button>
    <button @click="sendPrivateMessage">SEND PRIVATE MESSAGE</button>

    <p>
        {{ this.messages }}
    </p>
	
</body>
</html>

    




	
</template>

<style>
    
</style>