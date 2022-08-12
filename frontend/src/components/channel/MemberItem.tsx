import React, { useEffect, useState } from "react";
import { socket } from "../../App";
import ChannelProp from "../../interfaces/Channel.interface";
import ModifiedChannelInfoProp from "../../interfaces/modifyChannelInterface";
import UserProp from "../../interfaces/User.interface";
import classes from "../../Pages/ChatPage.module.css";

const MemberItem: React.FC<{ member: UserProp; channel: ChannelProp }> = (
  props
) => {
  // const [imageToDisplay, setImageToDisplay] = useState<string>(null);
  const [myId, setMyId] = useState<string>("");
  const [isBanned, setBanned] = useState<boolean>(false);
  const [isMuted, setMuted] = useState<boolean>(false);
  const [isAdmin, setAdmin] = useState<boolean> (false);
  const [isPrivate, setPrivate] = useState<boolean>(props.channel.private);

  useEffect(() => {
    fetch("http://localhost/backend/users/me")
      .then((response) => response.json())
      .then((data) => {
        setMyId(data.userId);
      });
    setPrivate(props.channel.private);
    // console.log("channel: ", props.channel);
  }, []);

  const handleBan = () => {
    setBanned((prevState) => !prevState);
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channel.title,
      newBan: props.member.username,
    };
    socket.emit("modifyChannel", modifiedInfo);
  };

  const handleUnban = () => {
    setBanned((prevState) => !prevState);
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channel.title,
      deleteBan: props.member.username,
    }
    socket.emit("modifyChannel", modifiedInfo);
  }

  const handleMute = () => {
    setMuted((prevState) => !prevState);
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channel.title,
      newMute: props.member.username,
    };
    socket.emit("modifyChannel", modifiedInfo);
  };

  const handleUnmute = () => {
    setMuted((prevState) => !prevState);
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channel.title,
      deleteMute: props.member.username
    };
    socket.emit("modifyChannel", modifiedInfo);
  }

  const handleAdmin = () => {
    setAdmin((prevState) => !prevState);
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channel.title,
      newAdmin: props.member.username,
    }
    socket.emit("modifyChannel", modifiedInfo);
  }

  const checkAdmin = (inputId: string) => {
    if (props.channel.admins) {
      for (const tmp of props.channel.admins) {
        if (tmp.userId === inputId) {
          return true;
        }
      }
    }
    return false;
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
          { checkAdmin(myId) ? (
            <button onClick={handleUnban}>
              unBan user
            </button>
              ) : null}
          { checkAdmin(myId) ? (
            <button onClick={handleBan}>
              Ban user
            </button>
              ) : null}
          { checkAdmin(myId) ? (
            <button onClick={handleUnmute}>
              unMute user
            </button>
              ) : null}
          { checkAdmin(myId) ? (
            <button onClick={handleMute}>
              Mute user
            </button>
              ) : null}
            { checkAdmin(myId) ? (
            <button onClick={handleAdmin}>
              Add admin
            </button>
              ) : null}
        </div>
      </div>
    </React.Fragment>
  );
};

export default MemberItem;
