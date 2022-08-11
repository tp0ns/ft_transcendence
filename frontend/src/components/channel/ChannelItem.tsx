import React, { useState } from "react";
import { Socket } from "socket.io-client";
import { socket } from "../../App";
import classes from "../../Pages/ChatPage.module.css";

const ChannelItem: React.FC<{
  displayChannel: () => void;
  displaySettings: () => void;
  name: string;
  private: boolean;
  socket: Socket;
}> = (props) => {
  const [deletedChannel, setDeleteChannel] = useState(false);

  const deleteChannel = () => {
    setDeleteChannel(true);
    socket.emit("deleteChan", props.name);
  };

  return (
    <div className={classes.channelItem}>
    <div className={classes.chanName}>
      <button onClick={props.displayChannel}>{props.name}</button>
      </div>
        <button onClick={props.displaySettings}>Settings</button>
        <button onClick={deleteChannel}>Delete</button>
    </div>
  );
};

export default ChannelItem;
