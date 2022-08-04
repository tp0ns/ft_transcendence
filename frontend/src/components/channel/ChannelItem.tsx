import React, { useState } from "react";
import { Socket } from "socket.io-client";
import Card from "../../ui/Card";
import { socket } from "../../App";

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
    <Card>
      <h1>{props.name}</h1>
      {props.private ? <h2>PRIVATE</h2> : null}
      <button onClick={props.displayChannel}>Join channel</button>
      <button onClick={props.displaySettings}>Settings</button>
      <button onClick={deleteChannel}>Delete</button>
    </Card>
  );
};

export default ChannelItem;
