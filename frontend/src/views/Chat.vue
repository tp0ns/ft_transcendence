<template>
	
<div>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Nestjs SocketIO</title>
    <link rel="stylesheet" href="styles.css">
    <!-- <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script> -->
    <!-- <script src="https://cdn.socket.io/4.3.2/socket.io.min.js" integrity="sha384-KAZ4DtjNhLChOB/hxXuKqhMLYvx3b5MlT55xPEiNmREKRzeEm+RVPlTnAn0ajQNs" crossorigin="anonymous"></script> -->
</head>
    <div id="app" class="container">
            <div class="row">
                <div class="col-md-6 offset-md-3 col-sm-12">
                    <h1 class="text-center">{{ name }}</h1>
                    <br>
                    <div id="status"></div>
                    <div id="chat">
                        <input type="text" v-model="title" id="username" class="form-control" placeholder="Enter title...">
                        <br>
                        <div class="card">
                            <div id="channels" class="card-block">
                                <ul>
                                    <button v-for="channel of channels" :key="channel.id"> {{ channel.title  }} </button>
                                    <!-- <li v-for="message of messages">{{ channel.title }} </li> -->
                                </ul>
                            </div>
                        </div>
                        <br>
                        <!-- <textarea id="textarea" class="form-control" v-model="owner" placeholder="Enter owner..."></textarea> -->
                         <!-- <textarea id="textarea" class="form-control" v-model="username" placeholder="Enter owner..."></textarea> -->
                        <!-- <textarea id="textarea" class="form-control" v-model="text" placeholder="Enter text..."></textarea> -->
                        <br>
                            <button id="send" class="btn" @click.prevent="createChannel">+</button>
                            <!-- <button id="get" class="btn" @click.prevent="getAllChannels">GetChans</button> -->
                            <button id="send" class="btn" @click.prevent="joinChannel">JOIN</button>
                        <!-- <button id="send" class="btn" @click.prevent="sendMessage">Send</button> -->
                    </div>
                </div>
            </div>
    </div>
</div>
</template>

<script>
 data: {
  name: 'Nestjs Websockets Chat';
  title: '';
  owner: '';
  text: '';
  username: '';
  channels: [];
  messages: [];
  socket: null
 }
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
//   }
//   receivedMessage(message) 
//   {
//     this.messages.push(message)
//   }
//   validateInput() 
//   {
//     return this.username.length > 0 && this.text.length > 0
//   }
  // }
// created() 
// {
//     this.socket = io('http://localhost:3000')
//     this.socket.on('channelMessage', (message) => {
//      this.receivedMessage(message)
//     })
//    } 
//  methods: {
  //  getAllChannels() 
  //  {
  //   this.socket.emit('getAllChannels');
  //  }
  //  createChannel()
  // {
  //    if(this.validateInput()) {
  //      const channel = {
  //        title: this.title,
  //       }
  //       this.socket.emit('createChan', channel)
  //     }
  //   }
  // printChannels(AllChans) 
  // {
  //   this.channels.push(AllChans)
  // }
  // receivedMessage(channel) 
  // {
  //   this.channels.push(channel)
  // }
  // validateInput() 
  // {
  //   return this.title.length > 0 
  // }
// }
// created() 
// {
//  this.socket = io('http://localhost/backend/')
//   this.socket.on('getChans', () => {
//     this.socket.emit('getAllChannels');
//          })
//   this.socket.on('sendChans', (channels) => {
//     this.printChannels(channels)
//   })
//    this.socket.on('createdChan', (channel) => {
//      this.receivedMessage(channel)
//    }),
//     this.socket.on('joinedChan', (channel) => {
//      this.receivedMessage(channel)
//      })
//     }
// })

</script>