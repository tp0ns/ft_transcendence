function ChannelItem(props: any) {
  return <li onClick={props.displayChannel}>{props.name}</li>;
}

export default ChannelItem;
