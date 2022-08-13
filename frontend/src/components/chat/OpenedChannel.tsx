import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import ChannelProp from "../../interfaces/Channel.interface";
import Card from "../../ui/Card";
import MessagesList from "./MessagesLists";
import classes from "././../../Pages/ChatPage.module.css";

const OpenedChannel: React.FC<{
  channel: ChannelProp;
  socket: Socket;
  leaveChannel: () => void;
}> = (props) => {
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [messages, setNewMessage] = useState<string[]>([]);

  const messageHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // console.log(messageInputRef.current!.value);
    if (messageInputRef.current!.value) {
      props.socket.emit(
        "msgToChannel",
        messageInputRef.current!.value,
        props.channel.title
      );
    }
  };

  const leaveHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    props.leaveChannel();
  };

  useEffect(() => {
    props.socket.on("channelMessage", (payload, username) => {
      // console.log("message from server: ", payload);
      let msg : string = username+" : "+payload[0];
      setNewMessage([...messages, msg]);
    });
  }, [messages, props.socket]);

  return (
    <div className={classes.openedChannel}>
      <h1>{props.channel.title}</h1>
      <div className={classes.messages}></div>
      <MessagesList messages={messages} />
      <input type="text" required id="image" ref={messageInputRef} />
      <button onClick={messageHandler}>Send message</button>
      <button onClick={leaveHandler}>Leave Channel</button>
    </div>
  );
};

export default OpenedChannel;
