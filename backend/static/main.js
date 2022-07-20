const app = new Vue({
 el: '#app',
 data: {
  name: 'Nestjs Websockets Chat',
  title: '',
  owner: '',
  text: '',
  username: '',
  channels: [],
  messages: [],
  socket: null
 },
// methods: {
// sendMessage() {
//     if(this.validateInput()) {
//       const message = {
//       username: this.username,
//       text: this.text
//     }
//     this.socket.emit('msgToChannel', message, 'test1')
//     this.text = ''
//     this.username = ''
//     }
//   },
//   receivedMessage(message) {
//     this.messages.push(message)
//   },
//   validateInput() {
//     return this.username.length > 0 && this.text.length > 0
//   }
//   }, 
// created() {
//     this.socket = io('http://localhost:3000')
//     this.socket.on('channelMessage', (message) => {
//      this.receivedMessage(message)
//     })
//    }, 
 methods: {
   getAllChannels() {
    this.socket.emit('getAllChannels');
   },
   getChannelByName() {
     this.socket.emit('getChannelByName');
   },
   createChannel() {
     if(this.validateInput()) {
       const channel = {
         title: this.title,
        }
        this.socket.emit('createChan', channel)
      }
    },
  printChannels(AllChans) {
    this.channels.push(AllChans)
  },
  printOneChannel(channel) {
    this.channels.push(channel);
  },
  receivedMessage(channel) {
    this.channels.push(channel)
  },
  validateInput() {
    return this.title.length > 0 
  },
},
created() {
 this.socket = io('http://localhost:3000')
  this.socket.on('getChans', (AllChans) => {
    this.printChannels(AllChans)
         })
   this.socket.on('createdChannel', (channel) => {
     this.receivedMessage(channel)
     })
    this.socket.on('getChanByName', (channel) => {
      this.printOneChannel(channel)
    })
 },
})
