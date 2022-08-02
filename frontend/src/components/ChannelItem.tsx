import React from "react";
import Card from "../ui/Card";

const ChannelItem: React.FC<{
  displayChannel: () => void;
  name: string;
  private: boolean;
}> = (props) => {
  console.log(props.private);
  return (
    <Card>
      <h1>{props.name}</h1>
      {props.private ? <h2>PRIVATE</h2> : null}
      <button onClick={props.displayChannel}>Join channel</button>
    </Card>
  );
};

export default ChannelItem;
