import { createRouter, createWebHistory } from 'vue-router';
import Chat from './../views/Chat.vue';
import Home from './../views/WelcomeMsg.vue';

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

]

const router = createRouter({
	history: createWebHistory(),
	routes
})
export default router;