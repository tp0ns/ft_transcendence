import { useEffect, useState } from "react";
import { socket } from "../../App";
import ChannelProp from "../../interfaces/Channel.interface";
import ModifiedChannelInfoProp from "../../interfaces/modifyChannelInterface";
import InputAndButton from "../../ui/InputAndButton";
import classes from "./NewChannelForm.module.css";

// Change password if Owner
// Add Admins if Owner or Admins
// Ban and mute if Owner or Administrator
// Add members if private Chan and everyone

const Settings: React.FC<{ channel: ChannelProp }> = (props) => {
  const [myId, setMyId] = useState<string>("");
  const [isBanned, setBanned] = useState<boolean>(false);
  const [isMuted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    fetch("http://localhost/backend/users/me")
      .then((response) => response.json())
      .then((data) => {
        console.log("data.userId: ", data.userId);
        setMyId(data.userId);
      });
  }, []);

  const isOwner = () => {
    console.log("my userId: ", myId);
    console.log("owner Id: ", props.channel.owner.userId);
    return myId === props.channel.owner.userId;
  };

  const isAdmin = (inputId: string) => {
    if (isOwner()) {
      return true;
    }
    if (props.channel.admins) {
      props.channel.admins!.map((admin) => {
        if (admin.userId === inputId) return true;
      });
    }
    return false;
  };

  const isMember = (inputId: string) => {
    if (props.channel.members) {
      props.channel.members!.map((member) => {
        if (member.userId === inputId) return true;
      });
    }
    return false;
  };

  const handlePasswordChange = (inputPassword: string) => {
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channel.title,
      newPassword: inputPassword,
    };
    socket.emit("modifyChannel", modifiedInfo);
  };

  const handleNewAdmin = (inputUser: string) => {
    props.channel.members!.map((member) => {
      if (member.username === inputUser && !isAdmin(member.userId)) {
        const modifiedInfo: ModifiedChannelInfoProp = {
          title: props.channel.title,
          newAdmin: inputUser,
        };
        socket.emit("modifyChannel", modifiedInfo);
      }
    });
  };

  const handleNewMember = (inputUser: string) => {
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channel.title,
      newMember: inputUser,
    };
    if (props.channel.private) {
      socket.emit("modifyChannel", modifiedInfo);
    }
  };

  const handleBan = (inputUser: string) => {
    setBanned((prevState) => !prevState);
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channel.title,
      newBan: isBanned ? inputUser : undefined,
      deleteBan: !isBanned ? inputUser : undefined,
    };
  };

  const handleMute = (inputUser: string) => {
    setMuted((prevState) => !prevState);
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channel.title,
      newMute: isMuted ? inputUser : undefined,
      deleteMute: !isMuted ? inputUser : undefined,
    };
  };

  return (
    <div className={classes.control}>
      <h1>BITEEE</h1>
      <p>{isOwner()}</p>
      {isOwner() ? (
        <InputAndButton
          buttonName="Change Password"
          capturedInfo={handlePasswordChange}
        />
      ) : null}
      {isAdmin(myId) ? (
        <div>
          <InputAndButton
            buttonName="Add admin"
            capturedInfo={handleNewAdmin}
          />
          <InputAndButton
            buttonName={isBanned ? "unBan user" : "Ban user"}
            capturedInfo={handleBan}
          />
          <InputAndButton
            buttonName={isMuted ? "unMute user" : "Mute user"}
            capturedInfo={handleMute}
          />
        </div>
      ) : null}
      {isMember(myId) ? (
        <InputAndButton
          buttonName="Add member"
          capturedInfo={handleNewMember}
        />
      ) : null}
    </div>
  );
};

export default Settings;
