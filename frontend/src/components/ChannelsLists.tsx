import ChannelItem from "./ChannelItem";

function ChannelsList(props: any) {
  return (
    <section>
      <ul>
        {props.channels.map((channel: any) => (
          <ChannelItem
            key={channel.id}
            name={channel.title}
            displayChannel={props.displayChannelHandler}
          />
        ))}
      </ul>
    </section>
  );
}

export default ChannelsList;
