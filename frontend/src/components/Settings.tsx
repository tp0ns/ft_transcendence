import { channel } from "diagnostics_channel";
import { useEffect, useState } from "react";
import { socket } from "../App";
import ChannelProp from "../interfaces/Channel.interface";
import InputAndButton from "../ui/InputAndButton";
import classes from "./NewChannelForm.module.css";

// Change password if Owner
// Change Admins if Owner
// Add members if private Chan and everyone

const Settings: React.FC<{ channel: ChannelProp }> = (props) => {
  const [myId, setMyId] = useState<string>();

  useEffect(() => {
    fetch("http://localhost/backend/users/me")
      .then((response) => response.json())
      .then((data) => {
        console.log("data.userId: ", data.userId);
        setMyId(data.userId);
      });
  }, []);

  const isOwner = () => {
    return myId === props.channel.owner.id;
  };

  const handlePasswordChange = (inputPassword: string) => {
    props.channel.password = inputPassword;
    socket.emit("modifyChannel", props.channel);
  };

  return (
    <div className={classes.control}>
      {isOwner() ? (
        <InputAndButton
          buttonName="Change Password"
          capturedInfo={handlePasswordChange}
        />
      ) : null}
    </div>
  );
};

export default Settings;
