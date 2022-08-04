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
      <h1>{props.name}</h1>
      <div>
        <button onClick={props.displayChannel}>Join channel</button>
        <button onClick={props.displaySettings}>Settings</button>
        <button onClick={deleteChannel}>Delete</button>
      </div>
    </div>
  );
};

export default ChannelItem;
