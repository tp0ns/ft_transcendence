import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
  }, []);

  // socket.on("updatedRelations", () => {
  //   console.log("status after update: ", props.relation.status);
  //   manageStatus();
  // });

  const handleBlock = () => {
    setStatus("blocker");
    if (props.myId === props.relation.creator?.userId)
      socket.emit("blockUser", props.relation.receiver?.username);
    else socket.emit("blockUser", props.relation.creator?.username);
  };

  const handleRequest = () => {
    socket.emit("acceptRequest", props.relation.requestId);
  };

  const handleUnblock = () => {
    setStatus("accepted");
    socket.emit("unblockUser", props.relation.requestId);
  };

  const sendMessage = () => {
    if (props.myId === props.relation.creator?.userId) {
      socket.emit("createDM", {
        title: props.relation.creator?.username+"0"+props.relation.receiver?.username,
        DM: true, 
        user2: props.relation.receiver?.userId,
      }),
    socket.on('newDM', (title) => {
      //rajouter le title a l'url de redirection
      navigate("/chat/")
    });
    }
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
          <div className={classes.tmp}>
            <button className={classes.button} onClick={handleBlock}>
              Block
            </button>
            <img
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
