import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import ChannelProp from "../../interfaces/Channel.interface";
import Card from "../../ui/Card";
import MessagesList from "./MessagesLists";

const OpenedChannel: React.FC<{
  channel: ChannelProp;
  socket: Socket;
  leaveChannel: () => void;
}> = (props) => {
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [messages, setNewMessage] = useState<string[]>([]);

  const messageHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log(messageInputRef.current!.value);
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
    props.socket.on("channelMessage", (payload) => {
      console.log("message from server: ", payload);
      setNewMessage([...messages, payload[0]]);
    });
  }, [messages, props.socket]);

  return (
    <Card>
      <h1>{props.channel.title}</h1>
      <MessagesList messages={messages} />
      <input type="text" required id="image" ref={messageInputRef} />
      <button onClick={messageHandler}>Send message</button>
      <button onClick={leaveHandler}>Leave Channel</button>
    </Card>
  );
};

export default OpenedChannel;