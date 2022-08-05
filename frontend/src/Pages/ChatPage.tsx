import { useEffect, useState } from "react";
import ChannelsList from "../components/channel/ChannelsLists";
import NewChannelForm from "../components/channel/NewChannel";
import ChannelProp from "../interfaces/Channel.interface";
import OpenedChannel from "../components/channel/OpenedChannel";
import Settings from "../components/channel/Settings";
import { socket } from "../App";
import classes from "./ChatPage.module.css";
import NavBar from "../components/NavBar/NavBar";

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
    console.log("channel in settingHandler: ", channel);
    setSettings(channel);
  };

  useEffect(() => {
    console.log("channelSettings in useEffect: ", channelSettings);
  }, [channelSettings]);

  return (
    <section className={classes.section}>
		<NavBar />
      <div id={classes["channels_list"]}>
        {!newChannel ? (
          <button onClick={handleNewChannel}>Add Channel</button>
        ) : null}
        <ChannelsList
          // className={classes.ChannlesList}
          selectedChannel={handleOpenedChannel}
          displaySettings={settingsHandler}
          channels={channelsReceived}
          socket={socket}
        />
      </div>
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
