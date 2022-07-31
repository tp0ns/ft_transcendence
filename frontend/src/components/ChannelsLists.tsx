import ChannelProp from "../interfaces/Channel.interface";
import ChannelItem from "./ChannelItem";

const ChannelsList: React.FC<{ channels: any }> = (props) => {
  console.log("ChannlesList: ", props.channels);
  return (
    <section>
      <ul>
        {props.channels.map((channel: any) => (
          <ChannelItem key={channel.id} name={channel.title} />
        ))}
      </ul>
    </section>
  );
};

export default ChannelsList;
