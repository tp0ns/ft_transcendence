<template>
<div>
	<div id='debug'>
		<form
			id='forDebug'
			@submit="handleSubmit">
			<input
				id="eventToSend"
				type="text"
				v-model="eventToSend"
				placeholder="Enter event"

			/>
			<input
				id="arg1"
				type="text"
				v-model="arg1"
				placeholder="place first arg"
			/>
			<input
				id="arg2"
				type="text"
				v-model="arg2"
				placeholder="place second arg"
			/>
			<button type="submit"> Send </button>
			<button type="button" @click.prevent="clearArgs">Clear</button>
			<h3> 
				{{response}}
			</h3>
    		<pre>{{ syntaxHighlight(JSON.stringify(data, null, 2)) }}</pre>
		</form>
	</div>
					<!-- onChange={(e) => setEvent(e.target.value)}
					onChange={(e) => setArgs(e.target.value)}
					onChange={(e) => setArgs2(e.target.value)} -->

</div>
</template>


<script setup lang="ts">
import { ref } from "@vue/reactivity";
import { io, Socket } from "socket.io-client";


const response = ref('');
let eventToSend = "";
const arg1 = ref('');
const arg2 = ref('');
const data = ref<any>([]);
const socket: Socket = io('http://localhost/debug')

//faire function useEffect


function syntaxHighlight(json: any) {
	if (!json) return ""; //no JSON from response

	json = json
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
	return json.replace(
		/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
		function (match: any) {
			var cls = "number";
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = "key";
				} else {
					cls = "string";
				}
			} else if (/true|false/.test(match)) {
				cls = "boolean";
			} else if (/null/.test(match)) {
				cls = "null";
			}
			return '<span class="' + cls + '">' + match + "</span>";
		}
	);
}

function clearArgs() {
	response.value = '';
	arg1.value = '';
	arg2.value = '';
	//clear event egalement
}

function handleSubmit() //= (e: any) => {
{ 

		if (eventToSend && arg1 && arg2)
			socket.emit(eventToSend, arg1, arg2);
		else if (eventToSend && arg1)
			socket.emit(eventToSend, arg1);
		else if (eventToSend)
			socket.emit(eventToSend);
}

</script>

