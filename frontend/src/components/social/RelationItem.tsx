import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../App";
import RelationsProp from "../../interfaces/Relations.interface";
import UserProp from "../../interfaces/User.interface";
import classes from "../../Pages/SocialPage.module.css";

const RelationItem: React.FC<{
  relation: RelationsProp;
  myId: string;
}> = (props) => {
  const [toDisplay, setToDisplay] = useState<UserProp>();
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  const manageStatus = () => {
    if (props.relation.status === "blocked") {
      if (props.myId === props.relation.creator?.userId) {
        setStatus("blocker");
      } else setStatus("blocked");
    } else if (props.relation.status === "pending") {
      if (props.myId === props.relation.creator?.userId) {
        setStatus("requester");
      } else setStatus("requested");
    } else if (props.relation.status === "accepted") {
      setStatus("accepted");
    }
  };

  useEffect(() => {
    if (props.relation.creator?.userId === props.myId)
      setToDisplay(props.relation.receiver);
    else setToDisplay(props.relation.creator);
    manageStatus();
  }, [props.relation]);

  // socket.on("updatedRelations", () => {
  //   console.log("status after update: ", props.relation.status);
  //   manageStatus();
  // });

  const handleBlock = () => {
    if (props.myId === props.relation.creator?.userId)
      socket.emit("blockUser", {id: props.relation.receiver?.userId});
    else {
      socket.emit("blockUser", {id: props.relation.creator?.userId});
    }
  };

  const handleRequest = () => {
    socket.emit("acceptRequest", {id: props.relation.requestId});
  };

  const handleUnblock = () => {
    socket.emit("unblockUser", {id: props.relation.requestId});
  };

  const sendMessage = () => {
    if (props.myId === props.relation.creator?.userId)
      socket.emit("createDM", props.relation.receiver?.username);
    else socket.emit("createDM", props.relation.creator?.username);
    navigate("/chat");
  };

  return (
    <div
      className={
        status === "blocked"
          ? classes.relationItemBlocked
          : classes.relationItem
      }
    >
      <div className={classes.leftSide}>
        <img alt="dp" src={toDisplay?.image_url} className={toDisplay?.status === 'connected' ? classes.connected : toDisplay?.status === 'disconnected' ? classes.disconnected : classes.playing}></img>
        <h3>{toDisplay?.username}</h3>
      </div>
      <div className={classes.rightSide}>
        {status === "accepted" ? (
          <div className={classes.tmp}>
            <button className={classes.button} onClick={handleBlock}>
              Block
            </button>
            <img alt="chat"
              onClick={sendMessage}
              className={classes.logo}
              src="chat.svg"
            />
          </div>
        ) : null}
        {status === "blocker" ? (
          <button className={classes.button} onClick={handleUnblock}>
            unblock
          </button>
        ) : null}
        {status === "requested" ? (
          <button className={classes.button} onClick={handleRequest}>
            Accept
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default RelationItem;
