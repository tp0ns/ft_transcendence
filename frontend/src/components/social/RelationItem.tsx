import { useEffect, useState } from "react";
import { classicNameResolver, isPropertySignature } from "typescript";
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
  }, []);

  socket.on("updatedRelations", () => {
    console.log("status after update: ", props.relation.status);
    manageStatus();
  });

  const handleBlock = () => {
    if (props.myId === props.relation.creator?.userId)
      socket.emit("blockUser", props.relation.receiver?.username);
    else socket.emit("blockUser", props.relation.creator?.username);
  };

  const handleRequest = () => {
    socket.emit("acceptRequest", props.relation.requestId);
  };

  const handleUnblock = () => {
    console.log("YOUU");
    socket.emit("unblockUser", props.relation.requestId);
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
        <img src={toDisplay?.image_url} className={classes.img}></img>
        <h3>{toDisplay?.username}</h3>
      </div>
      <div className={classes.rightSide}>
        {status === "accepted" ? (
          <button className={classes.blockButton} onClick={handleBlock}>
            Block
          </button>
        ) : null}
        {status === "blocker" ? (
          <button className={classes.blockButton} onClick={handleUnblock}>
            unblock
          </button>
        ) : null}
        {status === "requested" ? (
          <button className={classes.requestButton} onClick={handleRequest}>
            Accept
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default RelationItem;
