import React from "react";
import Card from "../ui/Card";

const ChannelItem: React.FC<{ displayChannel: () => void; name: string }> = (
  props
) => {
  return (
    <Card>
      <h1>{props.name}</h1>
      <button onClick={props.displayChannel}>Join channel</button>
    </Card>
  );
};

export default ChannelItem;
