import { Socket } from "socket.io-client";
import ChannelProp from "../../interfaces/Channel.interface";
import ChannelItem from "./ChannelItem";

const ChannelsList: React.FC<{
  selectedChannel: (channel: ChannelProp) => void;
  displaySettings: (channel: ChannelProp) => void;
  socket: Socket;
  channels: any;
}> = (props) => {
  return (
    <section>
      <ul>
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
      </ul>
    </section>
  );
};

export default ChannelsList;
