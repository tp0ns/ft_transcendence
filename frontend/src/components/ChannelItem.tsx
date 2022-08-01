import React from "react";

const ChannelItem: React.FC<{ displayChannel: () => void; name: string }> = (
  props
) => {
  return (
    <li>
      <button onClick={props.displayChannel}>{props.name}</button>
    </li>
  );
};

export default ChannelItem;
