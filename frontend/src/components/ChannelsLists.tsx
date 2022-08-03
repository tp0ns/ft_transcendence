import ChannelProp from "../interfaces/Channel.interface";
import ChannelItem from "./ChannelItem";

const ChannelsList: React.FC<{
  selectedChannel: (channel: ChannelProp) => void;
  channels: any;
}> = (props) => {
  return (
    <section>
      <ul>
        {props.channels.map((channel: any) => {
          console.log("channel in channelList", channel);
          return (
            <ChannelItem
              displayChannel={() => {
                props.selectedChannel(channel);
              }}
              key={channel.id}
              name={channel.title}
              private={channel.private}
            />
          );
        })}
      </ul>
    </section>
  );
};

export default ChannelsList;
