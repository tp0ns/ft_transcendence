import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import ChannelsList from "../components/ChannelsLists";
import NewChannelForm from "../components/NewChannel";

const DUMMY_CHANNELS = [
  {
    name: "yala1",
  },
  {
    name: "yala2",
  },
];

let socket : any;
let CONNEXION_PORT = 'localhost/backend'
const channels: any = [];

function ChatPage() {
  const [newChannel, setNewChannel] = useState(false);
  const [loadedChannels, setLoadedChannels] = useState([]);

  useEffect(() => {
    socket = io(CONNEXION_PORT);
    socket.emit("getAllChannels");
    socket.on("sendChans", channels);
    setLoadedChannels(channels);
  });

  function addChannel(newChannel: any) {
    console.log(`enter in add channel `);
    setNewChannel(false);
    socket.emit("createChan", newChannel);
  }

  function handleNewChannel() {
    setNewChannel(true);
  }


  async function getChannels() {}

  return (
    <section>
      <button onClick={handleNewChannel}>Add Channel</button>
      <ChannelsList channels={loadedChannels} />
      {newChannel ? <NewChannelForm onAddChannel={addChannel} /> : null}
    </section>
  );
}

export default ChatPage;