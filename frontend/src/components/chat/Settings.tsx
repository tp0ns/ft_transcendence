import { time } from "console";
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
  const [isProtected, setProtected] = useState<boolean>(
    props.channel.protected
  );
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

  const isOwner = () => {
    // console.log("My id: ", myId);
    return myId === props.channel.owner.userId;
  };

  const isMember = (inputId: string) => {
    props.channel.members!.map((member) => {
      if (member.userId === inputId) {
        return true;
      }
    });
    return true;
  };

  const handlePasswordChange = (inputPassword: string) => {
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channel.title,
      newPassword: inputPassword,
    };
    socket.emit("modifyChannel", modifiedInfo);
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

  const handleProtected = () => {
    setProtected((prevState) => !prevState);
    const modifiedInfo: ModifiedChannelInfoProp = {
      title: props.channel.title,
      protected: isProtected,
    };
    socket.emit("modifyChannel", modifiedInfo);
  };

  return (
    <div className={classes.control}>
      <h1>{props.channel.title}</h1>
      <p>{isOwner()}</p>
      {isOwner() && isProtected ? (
        <div>
          <InputAndButton
            buttonName="Change Password"
            capturedInfo={handlePasswordChange}
          />
        </div>
      ) : null}
      {isOwner() ? (
        <button onClick={handleProtected}>
          {isProtected ? "Unprotect" : "Protect"}
        </button>
      ) : null}
      {isMember(myId) && isPrivate ? (
        <InputAndButton
          buttonName="Add member"
          capturedInfo={handleNewMember}
        />
      ) : null}
    </div>
  );
};

export default Settings;
