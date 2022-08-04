import { useEffect, useState } from "react";
import ChannelsList from "../components/channel/ChannelsLists";
import NewChannelForm from "../components/channel/NewChannel";
import ChannelProp from "../interfaces/Channel.interface";
import OpenedChannel from "../components/channel/OpenedChannel";
import Settings from "../components/channel/Settings";
import { socket } from "../App";
import classes from "./ChatPage.module.css";
import React from "react";
import NavBar from "../components/NavBar/NavBar";
import ChannelMembersList from "../components/channel/ChannelMembersList";

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

  useEffect(() => {
    socket.emit("getAllChannels");
    socket.on("sendChans", (channels) => {
      setChannelsReceived(channels);
      setOpenedChannel(channels[0]);
    });
  }, []);

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
    <React.Fragment>
      <NavBar />
      <section className={classes.section}>
        <div id={classes["channels_list"]}>
          {!newChannel ? (
            <button className={classes.addChannel} onClick={handleNewChannel}>
              Add Channel
            </button>
          ) : null}
          <ChannelsList
            selectedChannel={handleOpenedChannel}
            displaySettings={settingsHandler}
            channels={channelsReceived}
            socket={socket}
          />
        </div>
        {newChannel ? <NewChannelForm sendChan={sendChannel} /> : null}
        {openedChannel ? (
          <div id={classes["channel_group"]}>
            <OpenedChannel
              channel={openedChannel}
              socket={socket}
              leaveChannel={leaveChannelHandler}
            />
            <ChannelMembersList channel={openedChannel} socket={socket} />
          </div>
        ) : null}
        {channelSettings ? <Settings channel={channelSettings} /> : null}
      </section>
    </React.Fragment>
  );
}

export default ChatPage;
