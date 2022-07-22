<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import WelcomeMsg from './components/WelcomeMsg.vue'
import io from 'socket.io-client'

const socket = {
	status: io(`http://localhost`),
	chat: 'io()',
	game: 'io()',
}

</script>

<template>
  <WelcomeMsg msg="Clique 10 fois"/>
</template>

<style scoped>
</style>
