import ChannelsList from "../components/ChannelsLists";

const DUMMY_CHANNELS = [
  {
    name: "yala1",
  },
  {
    name: "yala2",
  },
];

function ChatPage() {
  return (
    <section>
      <ChannelsList channels={DUMMY_CHANNELS} />
    </section>
  );
}

export default ChatPage;
