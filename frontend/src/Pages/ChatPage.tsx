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

const socket: Socket = io("http://localhost");

function ChatPage() {
  const [newChannel, setNewChannel] = useState(false);
  const [loadedChannels, setLoadedChannels] = useState([]);

  function addChannel(newChannel: any) {
    setNewChannel(false);
    socket.emit("createChan", newChannel);
  }

  function handleNewChannel() {
    setNewChannel(true);
  }

  useEffect(() => {
    const channels: any = [];
    socket.emit("getAllChannels");
    socket.on("sendChans", channels);
    setLoadedChannels(channels);
  });

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
