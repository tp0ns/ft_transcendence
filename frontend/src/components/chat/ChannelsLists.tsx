import { Socket } from "socket.io-client";
import ChannelProp from "../../interfaces/Channel.interface";
import ChannelItem from "./ChannelItem";

const ChannelsList: React.FC<{
  selectedChannel: (channel: ChannelProp) => void;
  displaySettings: (channel: ChannelProp) => void;
  socket: Socket;
  channels: any;
}> = (props) => {
  console.log(`channels recu dans le front :`, props.channels);
  return (
    <div >
      {props.channels.map((channel: any) => {
        return (
          <ChannelItem
            displayChannel={() => {
              props.selectedChannel(channel);
            }}
            displaySettings={() => {
              props.displaySettings(channel);
            }}
            key={channel.id}
            name={channel.title}
            private={channel.private}
            socket={props.socket}
          />
        );
      })}
    </div>
  );
};

export default ChannelsList;
