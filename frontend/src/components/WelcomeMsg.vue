<template>
	<h1>{{msg}}</h1>
	<button @click="increment"> You clicked {{count}} me time ! </button>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps({
	msg: String,
})

// reactive state
const count = ref(42)

// functions that mutate state and trigger updates
function increment() {
	count.value++;
	declare()
}

function declare () {
	console.log(props.msg);
}

// lifecycle hooks
onMounted(() => {
	console.log(`The initial count is ${count.value}.`)
})
</script>

<style scoped>
</style>
