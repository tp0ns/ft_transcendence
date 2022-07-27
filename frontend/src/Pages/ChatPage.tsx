import { io, Socket } from "socket.io-client";
import { useState } from "react";
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

const socket: Socket = io("http://localhost");

function ChatPage() {
  const [newChannel, setNewChannel] = useState(false);

  function addChannel(newChannel: any) {
    setNewChannel(false);
    socket.emit("createChan", newChannel);
  }

  function handleNewChannel() {
    setNewChannel(true);
  }

  async function getChannels() {
    // const channels: any = [];
    // socket.emit("getAllChannels");
    // socket.on("sendChans", channels);
    // return channels;
  }

  return (
    <section>
      <button onClick={handleNewChannel}>Add Channel</button>
      {/* <ChannelsList channels={DUMMY_CHANNELS} /> */}
      {newChannel ? <NewChannelForm onAddChannel={addChannel} /> : null}
    </section>
  );
}

export default ChatPage;
