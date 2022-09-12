import jwtDecode, { JwtPayload } from "jwt-decode";
import { useContext } from "react";
import { useCookies } from "react-cookie";
import ChatContext from "../../../../../context/chat-context";
import MessageInterface from "../../../../../interfaces/Message.interface";
import classes from "./Message.module.css";

const Message: React.FC<{ message: MessageInterface }> = (props) => {
	const ctx = useContext(ChatContext);
	return (
		<div
			className={
				props.message.user.userId === ctx!.clientId
					? classes.client_message
					: classes.others_message
			}
		>
			<img
				src={
					props.message.user.profileImage
						? props.message.user.profileImage
						: props.message.user.image_url
				}
				alt="Profile"
				className={classes.picture}
			/>
			<div className={classes.msg_layout}>
				<div className={classes.author}>{props.message.user.username}</div>
				<div className={classes.message}>{props.message.message}</div>
			</div>
		</div>
	);
};

export default Message;
