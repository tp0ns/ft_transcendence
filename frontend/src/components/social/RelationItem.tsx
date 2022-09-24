import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../App";
import RelationsProp from "../../interfaces/Relations.interface";
import UserProp from "../../interfaces/User.interface";
import classes from "../../Pages/SocialPage/SocialPage.module.css";

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
	}, [props.relation]);

	const handleBlock = () => {
		if (props.myId === props.relation.creator?.userId)
			socket.emit("blockUser", { id: props.relation.receiver?.userId });
		else {
			socket.emit("blockUser", { id: props.relation.creator?.userId });
		}
	};

	const handleRequest = () => {
		socket.emit("acceptRequest", { id: props.relation.requestId });
	};

	const handleUnblock = () => {
		socket.emit("unblockUser", { id: props.relation.requestId });
	};

	const sendMessage = () => {
		let user_2;
		{
			props.relation.receiver!.userId === props.myId
				? (user_2 = props.relation.creator?.userId)
				: (user_2 = props.relation.receiver?.userId);
		}
		socket.emit("createDM", {
			title: "DM",
			DM: true,
			user2: user_2,
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
				<img
					alt="dp"
					src={
						toDisplay?.profileImage
							? toDisplay.profileImage
							: toDisplay?.image_url
					}
					className={
						toDisplay?.status === "connected"
							? classes.connected
							: toDisplay?.status === "disconnected"
							? classes.disconnected
							: classes.playing
					}
				></img>
				<h3 className={classes.username}>{toDisplay?.username}</h3>
			</div>
			<div className={classes.rightSide}>
				{status === "accepted" ? (
					<div className={classes.tmp}>
						<div className={classes.button} onClick={handleBlock}>
							<img alt="block" className={classes.logo} src="/ban.svg" />
						</div>
						<div className={classes.button}>
							<img
								alt="chat"
								onClick={sendMessage}
								className={classes.logo}
								src="/chat.svg"
							/>
						</div>
					</div>
				) : null}
				{status === "blocker" ? (
					<div className={classes.button} onClick={handleUnblock}>
						<img alt="unblock" className={classes.logo} src="/unban.svg" />
					</div>
				) : null}
				{status === "requested" ? (
					<div className={classes.button} onClick={handleRequest}>
						<img
							alt="accept friend invite"
							className={classes.logo}
							src="/accept.svg"
						/>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default RelationItem;
