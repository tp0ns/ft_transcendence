import ChannelProp from "../interfaces/Channel.interface";
import ChannelItem from "./ChannelItem";

const ChannelsList: React.FC<{
  displayChannel: (channel: any) => void;
  channels: any;
}> = (props) => {
  return (
    <section>
      <ul>
        {props.channels.map((channel: any) => (
          <ChannelItem
            displayChannel={() => {
              props.displayChannel(channel);
            }}
            key={channel.id}
            name={channel.title}
          />
        ))}
      </ul>
    </section>
  );
};

export default ChannelsList;
