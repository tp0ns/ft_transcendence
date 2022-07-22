<template>
	<h1>{{msg}}</h1>
	<button v-if="!done" @click="increment"> You clicked me {{count}} time ! </button>
	<button v-if="done" @click="increment">Restart</button>
	<h1 v-if="done">Bravo !</h1>
</template>

<script setup lang="ts">
import { Socket } from 'engine.io-client';
import { ref, onMounted } from 'vue'

const props = defineProps({
	msg: String,
})

// reactive state
const count = ref(0)
const done = ref(false)

// functions that mutate state and trigger updates
function increment() {
	socket.chat.emit("coucou")
	count.value++;
	if (count.value == 10)
		done.value = true;
	else if ( count.value == 11) {
		count.value = 0;
		done.value = false;
	}
	declare()
}

function restart() {
	done.value = false
	count.value = 0
}

function declare () {
	console.log(done.value);
}

// lifecycle hooks
onMounted(() => {
	console.log(`The initial count is ${count.value}.`)
})
</script>

<style scoped>
</style>
