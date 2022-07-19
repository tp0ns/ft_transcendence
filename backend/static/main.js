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

//  methods: {
//  sendMessage() {
//      if(this.validateInput()) {
//       const message = {
//       username: this.username,
//       text: this.text
//      }
//      this.socket.emit('msgToServer', message)
//      this.text = ''
//     }
//    },
//    receivedMessage(message) {
//     this.messages.push(message)
//    },
//    validateInput() {
//     return this.username.length > 0 && this.text.length > 0
//    }
//   },
//    created() {
//     this.socket = io('http://localhost:3000')
//     this.socket.on('msgToClient', (message) => {
//      this.receivedMessage(message)
//     })
//    },  
//     methods: {
//     sendMessage() {
//         if(this.validateInput()) {
//          const message = {
//          username: this.username,
//          text: this.text
//         }
//         this.socket.emit('msgToChannel', message, 'test1')
//         this.text = ''
//         this.username = ''
//        }
//       },
//       receivedMessage(message) {
//        this.messages.push(message)
//       },
//       validateInput() {
//        return this.username.length > 0 && this.text.length > 0
//       }
//      }, 
// created() {
//     this.socket = io('http://localhost:3000')
//     this.socket.on('channelMessage', (message) => {
//      this.receivedMessage(message)
//     })
//    }, 
//  methods: {
//   createChannel() {
//    if(this.validateInput()) {
//     const channel = {
//     title: this.title,
//    }
//    this.socket.emit('createChan', channel)
//   }
//  },
//  receivedMessage(channel) {
//   this.channels.push(channel)
//  },
//  validateInput() {
//   return this.title.length > 0 
//  }
// },
//  created() {
//   this.socket = io('http://localhost:3000')
//   this.socket.on('createdChannel', (channel) => {
//    this.receivedMessage(channel)
//   })
//  },
 methods: {
    joinChannel() {
     if(this.validateInput()) {
      const channel = {
      title: this.title,
     }
     this.socket.emit('joinChannel', channel.title)
    }
   },
   receivedMessage(channel) {
    this.channels.push(channel.title)
   },
   validateInput() {
    return this.title.length > 0
   }
  },
   created() {
    this.socket = io('http://localhost/backend/')
    this.socket.on('joinedChan', (channel) => {
     this.receivedMessage(channel)
    })
   }
})