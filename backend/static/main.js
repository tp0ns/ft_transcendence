const app = new Vue({
 el: '#app',
 data: {
  name: 'Nestjs Websockets Chat',
  title: '',
  owner: '',
  channels: [],
  socket: null
 },
//  methods: {
// 	createChannel() {
// 		const message = {
// 			title:"good",
// 			user:"clara lpb"
// 		}
// 		this.socket.emit('createChan', message)
// 	}
//  },
 methods: {
  sendMessage() {
   if(this.validateInput()) {
    const message = {
    title: this.title,
    owner: this.owner
   }
   this.socket.emit('createChan', message)
   this.owner = ''
  }
 },
 receivedMessage(message) {
  this.channels.push(message)
 },
 validateInput() {
  return this.name.length > 0 && this.owner.length > 0
 }
},
 created() {
  this.socket = io('http://localhost:3000')
  this.socket.on('createdChannel', (message) => {
   this.receivedMessage(message)
  })
 }
})