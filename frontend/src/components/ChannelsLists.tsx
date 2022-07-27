import ChannelItem from "./ChannelItem";

function ChannelsList(props: any) {
  return (
    <section>
      <ul>
        {props.channels.map((channel: any) => (
          <ChannelItem name={channel.name} />
        ))}
      </ul>
    </section>
  );
}

export default ChannelsList;
