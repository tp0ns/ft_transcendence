import { useContext } from "react";
import { socket } from "../../../../../App";
import ChatContext from "../../../../../context/chat-context";
import UserProp from "../../../../../interfaces/User.interface";
import classes from "./BannedMemberItem.module.css";

const BannedMemberItem: React.FC<{ member: UserProp }> = (props) => {
	const ctx = useContext(ChatContext);

	function unban() {
		const modifyChan = {
			title: ctx?.activeChan?.title,
			deleteBan: props.member.userId,
		};
		socket.emit("modifyChannel", modifyChan);
	}

	return (
		<div className={classes.itemLayout}>
			<img
				src={
					props.member?.profileImage
						? props.member.profileImage
						: props.member?.image_url
				}
				alt="Avatar"
				className={classes.badge}
			/>
			<div className={classes.name}>{props.member.username}</div>
			{ctx?.isAdmin ? (
				<div
					className={classes.button}
					onClick={() => {
						unban();
					}}
				>
					<img src="unban.svg" alt="unban" />
				</div>
			) : null}
		</div>
	);
};

export default BannedMemberItem;
