import ChannelItem from "./ChannelItem";

function ChannelsList(props: any) {
  return (
    <ul>
      {props.channels.map((channel: any) => (
        <ChannelItem name={channel.name} />
      ))}
    </ul>
  );
}

export default ChannelsList;
