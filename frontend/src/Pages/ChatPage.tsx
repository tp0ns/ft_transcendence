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

const socket: Socket = io("http://localhost");

// const channels: any = [];

function ChatPage() {
  // const channelsCtx = useContext(ChannelsContext);

  const [newChannel, setNewChannel] = useState(false);
  const [channelsReceived, setChannelsReceived] = useState([]);
  // const [loadedChannels, setLoadedChannels] = useState([]);

  const handleNewChannel = () => {
    setNewChannel(true);
  };

  console.log("Before getAllChannels emit!");
  socket.emit("getAllChannels");
  console.log("After getAllChannels emit!");
  socket.on("sendChans", (channels) => {
    setChannelsReceived(channels);
  });
  console.log("After sendChans emit!");

  const sendChannel = (channelData: ChannelProp) => {
    setNewChannel(false);
    socket.emit("createChan", channelData);
  };

  return (
    <section>
      {!newChannel ? (
        <button onClick={handleNewChannel}>Add Channel</button>
      ) : null}
      <ChannelsList channels={channelsReceived} />
      {newChannel ? <NewChannelForm sendChan={sendChannel} /> : null}
    </section>
  );
}

export default ChatPage;
