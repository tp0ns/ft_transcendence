const MessagesList: React.FC<{ messages: string[] }> = (props) => {
  return (
    <ul>
      {props.messages.map((message) => {
        return <li>{message}</li>;
      })}
    </ul>
  );
};

export default MessagesList;
