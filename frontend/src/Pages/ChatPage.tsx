import { io, Socket } from "socket.io-client";
import { useContext, useEffect, useState } from "react";
import ChannelsList from "../components/ChannelsLists";
import NewChannelForm from "../components/NewChannel";
import ChannelProp from "../interfaces/Channel.interface";
import OpenedChannel from "../components/OpenedChannel";

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
  const [openedChannel, setOpenedChannel] = useState<ChannelProp | null>(null);

  const handleNewChannel = () => {
    setNewChannel(true);
  };

  useEffect(() => {
    console.log("Before getAllChannels emit!");
    socket.emit("getAllChannels");
    console.log("After getAllChannels emit!");
    socket.on("sendChans", (channels) => {
      setChannelsReceived(channels);
    });
    console.log("After sendChans emit!");
  }, [newChannel]);

  const sendChannel = (channelData: ChannelProp) => {
    setNewChannel(false);
    socket.emit("createChan", channelData);
  };

  const handleOpenedChannel = (channel: any) => {
    setOpenedChannel(channel);
  };

  const leaveChannelHandler = () => {
    setOpenedChannel(null);
  };

  return (
    <section>
      {!newChannel ? (
        <button onClick={handleNewChannel}>Add Channel</button>
      ) : null}
      <ChannelsList
        displayChannel={handleOpenedChannel}
        channels={channelsReceived}
      />
      {newChannel && !openedChannel ? (
        <NewChannelForm sendChan={sendChannel} />
      ) : null}
      {!newChannel && openedChannel ? (
        <OpenedChannel
          channel={openedChannel}
          socket={socket}
          leaveChannel={leaveChannelHandler}
        />
      ) : null}
    </section>
  );
}

export default ChatPage;
