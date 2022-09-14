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
		socket.on("newDM", (id) => {
			navigate("/chat/" + id);
		});
	}, []);

  useEffect(() => {
    if (props.relation.creator?.userId === props.myId)
      setToDisplay(props.relation.receiver);
    else setToDisplay(props.relation.creator);
    manageStatus();
    socket.emit("isBlocked", { id: toDisplay?.userId });
    socket.on("isBlockedRes", (data) => (console.log(data)));
  }, [props.relation]);

  const handleBlock = () => {
    if (props.myId === props.relation.creator?.userId)
      socket.emit("blockUser", { id: props.relation.receiver?.userId });
    else {
      socket.emit("blockUser", { id: props.relation.creator?.userId });
    }
  };

  const sendMessage = () => {
    if (props.myId === props.relation.creator?.userId)
      socket.emit("createDM", props.relation.receiver?.username);
    else socket.emit("createDM", props.relation.creator?.username);
    navigate("/chat");
  };

  const handleRequest = () => {
    socket.emit("acceptRequest", { id: props.relation.requestId });
  };

  const handleUnblock = () => {
    socket.emit("unblockUser", { id: props.relation.requestId });
  };

	const sendMessage = () => {
		console.log(`enter in sendMessage in front`)
			socket.emit("createDM", {
				title:
					props.relation.creator?.username +
					"0" +
					props.relation.receiver?.username,
				DM: true,
				user2: props.relation.receiver?.userId,
				protected: false,
				private: false,
				password: null,
			});
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
