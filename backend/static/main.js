const app = new Vue({
 el: '#app',
 data: {
  title: 'Nestjs Websockets Chat',
  chanName: '',
  owner: '',
  channels: [],
  socket: null
 },
 methods: {
  createChannel() {
   if(this.validateInput()) {
    const message = {
    chanName: this.chanName,
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
  return this.chanName.length > 0 && this.owner.length > 0
 }
},
methods: {
	joinChannel() {
	 if(this.validateInput()) {
	  const message = {
	  chanName: this.chanName,
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
	return this.chanName.length > 0 && this.owner.length > 0
   }
  },
 created() {
  this.socket = io('http://localhost:3000')
  this.socket.on('createdChannel', (message) => {
   this.receivedMessage(message)
  })
 }
})