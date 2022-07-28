import { io, Socket } from "socket.io-client";
import { useContext, useEffect, useState } from "react";
import ChannelsList from "../components/ChannelsLists";
import NewChannelForm from "../components/NewChannel";
import { ChannelsContext } from "../store/channels-context";

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
  const channelsCtx = useContext(ChannelsContext);

  const [newChannel, setNewChannel] = useState(false);
  // const [loadedChannels, setLoadedChannels] = useState([]);

  const handleNewChannel = () => {
    setNewChannel(true);
  };

  useEffect(() => {
    setNewChannel(false);
  }, [channelsCtx]);

  console.log(newChannel);
  return (
    <section>
      {!newChannel ? (
        <button onClick={handleNewChannel}>Add Channel</button>
      ) : null}
      <ChannelsList channels={channelsCtx.items} />
      {newChannel ? <NewChannelForm /> : null}
    </section>
  );
}

export default ChatPage;
