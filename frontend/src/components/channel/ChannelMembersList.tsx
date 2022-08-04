import React from "react";
import { Socket } from "socket.io-client";
import ChannelProp from "../../interfaces/Channel.interface";
import MemberItem from "./MemberItem";

const ChannelMembersList: React.FC<{ channel: ChannelProp; socket: Socket }> = (
  props
) => {
  return (
    <React.Fragment>
      {props.channel.members?.map((member) => {
        console.log("members: ", member);
        return (
          <MemberItem member={member} channelTitle={props.channel.title} />
        );
      })}
    </React.Fragment>
  );
};

export default ChannelMembersList;
