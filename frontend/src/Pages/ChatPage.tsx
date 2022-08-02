import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import ChannelsList from "../components/ChannelsLists";
import NewChannelForm from "../components/NewChannel";
import ChannelProp from "../interfaces/Channel.interface";
import OpenedChannel from "../components/OpenedChannel";
import Settings from "../components/Settings";

const socket: Socket = io("http://localhost");

function ChatPage() {
  const [newChannel, setNewChannel] = useState(false);
  const [channelsReceived, setChannelsReceived] = useState([]);
  const [channelSettings, setSettings] = useState<ChannelProp | null>(null);
  const [openedChannel, setOpenedChannel] = useState<ChannelProp | null>(null);

  const handleNewChannel = () => {
    setNewChannel(true);
  };

  // useEffect(() => {
  //   console.log("entered useEffect");
  //   socket.emit("getAllChannels");
  //   socket.on("sendChans", (channels) => {
  //     setChannelsReceived(channels);
  //   });
  // }, [newChannel]);

  socket.on("updatedChannels", () => {
    socket.emit("getAllChannels");
    socket.on("sendChans", (channels) => {
      setChannelsReceived(channels);
    });
  });

  const sendChannel = (channelData: ChannelProp) => {
    console.log("entered sendChan");
    console.log("Channel Data in chat page: ", channelData);
    socket.emit("createChan", channelData);
    setNewChannel(false);
  };

  const handleOpenedChannel = (channel: ChannelProp) => {
    socket.emit("joinRoom", channel);
    setOpenedChannel(channel);
  };

  const leaveChannelHandler = () => {
    socket.emit("leaveRoom");
    setOpenedChannel(null);
  };

  const settingsHandler = (channel: ChannelProp) => {
    setSettings(channel);
  };

  return (
    <section>
      {!newChannel ? (
        <button onClick={handleNewChannel}>Add Channel</button>
      ) : null}
      <ChannelsList
        selectedChannel={handleOpenedChannel}
        displaySettings={settingsHandler}
        channels={channelsReceived}
        socket={socket}
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
      {channelSettings ? <Settings channel={channelSettings} /> : null}
    </section>
  );
}

export default ChatPage;
