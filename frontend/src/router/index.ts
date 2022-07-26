import { createRouter, createWebHistory } from 'vue-router';
import Chat from './../views/Chat.vue';
import Home from './../views/WelcomeMsg.vue';
import Debug from './../views/Debug.vue';

const routes = [
	{
		name: 'Home',
		path: '/',
		component: Home
	},
	
	{
		name: 'Chat', 
		path: '/chat', 
		component: Chat
	},

	{
		name: 'Debug',
		path: '/debug', 
		component: Debug,
	}

]

const router = createRouter({
	history: createWebHistory(),
	routes
})
export default router;