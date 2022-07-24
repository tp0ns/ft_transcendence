<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import WelcomeMsg from './views/WelcomeMsg.vue'
import io from 'socket.io-client'

const socket = {
	status: io(`http://localhost`),
	chat: 'io()',
	game: 'io()',
}

</script>

<template>
	<div>
	  <router-link to="/">Home | </router-link>
	  <router-link to= "/chat">Chat | </router-link>
	  <router-link to="/game">Game </router-link>
  <router-view id='container'/>
  </div>
</template>

<style scoped>
</style>
