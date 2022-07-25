<template>
	<div id="chat">
		<h1>C'est le chat quoi</h1>
		<input v-model="title" class="form-control" placeholder="Enter channel name..."/>
		<div>
			<ul>
				<li v-for="channel of channels"> {{ channel.title }} </li>
			</ul>
		</div>
		<button @click="createChannel">+</button>
	</div>
</template>

<script setup lang="ts">
	import { io, Socket } from 'socket.io-client';
	import { onMounted, ref } from 'vue';
	import IChannel from '../models/IChannel';

	const socket: Socket = io('http://localhost/')
	const title = ref('');
	let channels: IChannel[] = [];

	onMounted(() => {
		socket.emit('getAllChannels');
	})

	function validateInput() 
	{
		return title.value.length > 0 
	}

	function createChannel()
	{
		if(validateInput()) {
			const channel = {
				title: title.value,
			}
			socket.emit('createChan', channel)
		}
	}

	socket.on('sendChans', (channels) => {
	  initChannels(channels)
	})

	function initChannels(new_channels : IChannel[]) {
		channels = new_channels;
	}

	socket.on('createdChan', (channel) => {
	  addChannel(channel)
	  title.value= ''
	})

	function addChannel(new_chan : IChannel) 
	{
		channels = [...channels, new_chan];
	}

</script>