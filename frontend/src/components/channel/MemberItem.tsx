import React, { useState } from "react";
import { classicNameResolver } from "typescript";
import { socket } from "../../App";
import ModifiedChannelInfoProp from "../../interfaces/modifyChannelInterface";
import UserProp from "../../interfaces/User.interface";
import classes from "../../Pages/ChatPage.module.css";

const MemberItem: React.FC<{ member: UserProp; channelTitle: string }> = (
  props
) => {
  // const [imageToDisplay, setImageToDisplay] = useState<string>(null);
  const [isBanned, setBanned] = useState<boolean>(false);
  const [isMuted, setMuted] = useState<boolean>(false);

  const handleBan = () => {
    setBanned((prevState) => !prevState);
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channelTitle,
      newBan: isBanned ? props.member.username : undefined,
      deleteBan: !isBanned ? props.member.username : undefined,
    };
    socket.emit("modifyChannel", modifiedInfo);
  };

  const handleMute = () => {
    setMuted((prevState) => !prevState);
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channelTitle,
      newMute: isMuted ? props.member.username : undefined,
      deleteMute: !isMuted ? props.member.username : undefined,
    };
    socket.emit("modifyChannel", modifiedInfo);
  };

  return (
    <React.Fragment>
      <div className={classes.memberItem}>
        <div className={classes.profilePicture_username}>
          <img
            className={classes.img}
            src={props.member.image_url}
            alt="ProfilePicture"
          />
          <h1>{props.member.username}</h1>
        </div>
        <div>
          <button onClick={handleBan}>
            {isBanned ? "unBan user" : "Ban user"}
          </button>
          <button onClick={handleMute}>
            {isMuted ? "unMute user" : "Mute user"}
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default MemberItem;
