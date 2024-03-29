import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../App";
import MatchInviteInterface from "../../../interfaces/MatchInvite.interface";
import classes from "./InviteItem.module.css";

const InviteItem: React.FC<{ invite: MatchInviteInterface }> = (props) => {
	const navigate = useNavigate();

	useEffect(() => {
		socket.on("matchAccepted", (roomId) => {
			socket.emit("joinGame", roomId);
			navigate("/game");
		});
	}, []);

	function acceptInvite() {
		socket.emit("acceptInvite", props.invite.player1.userId);
	}

	function declineInvite() {
		socket.emit("refuseInvite", props.invite.player1.userId);
	}

	return (
		<div className={classes.item_layout}>
			<img src="/pong.svg" alt="Game invite" className={classes.logo} />
			<div className={classes.username}>{props.invite.player1.username}</div>
			<div
				className={classes.button}
				onClick={() => {
					acceptInvite();
				}}
			>
				<img src="/accept.svg" alt="Accept Invite" className={classes.logo} />
			</div>
			<div
				className={classes.button}
				onClick={() => {
					declineInvite();
				}}
			>
				<img src="/refuse.svg" alt="Refuse Invite" className={classes.logo} />
			</div>
		</div>
	);
};

export default InviteItem;
