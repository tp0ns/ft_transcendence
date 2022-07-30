import { io, Socket } from "socket.io-client";
import { useContext, useEffect, useState } from "react";
import ChannelsList from "../components/ChannelsLists";
import NewChannelForm from "../components/NewChannel";
import ChannelProp from "../interfaces/Channel.interface";

const DUMMY_CHANNELS = [
  {
    name: "yala1",
  },
  {
    name: "yala2",
  },
];

let channels: any = [];

const socket: Socket = io("http://localhost");
socket.on("getAllChannels", channels);

// const channels: any = [];

function ChatPage() {
  // const channelsCtx = useContext(ChannelsContext);

  const [newChannel, setNewChannel] = useState(false);
  // const [loadedChannels, setLoadedChannels] = useState([]);

  const handleNewChannel = () => {
    setNewChannel(true);
  };

  useEffect(() => {
    socket.on("getAllChannels", channels);
    console.log(channels);
  }, [socket]);

  const sendChannel = (channelData: ChannelProp) => {
    setNewChannel(false);
    socket.emit("createChan", channelData);
  };

  return (
    <section>
      {!newChannel ? (
        <button onClick={handleNewChannel}>Add Channel</button>
      ) : null}
      <ChannelsList channels={channels} />
      {newChannel ? <NewChannelForm sendChan={sendChannel} /> : null}
    </section>
  );
}

export default ChatPage;
