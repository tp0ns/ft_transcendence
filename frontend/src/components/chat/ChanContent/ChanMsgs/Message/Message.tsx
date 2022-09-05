import jwtDecode, { JwtPayload } from "jwt-decode";
import { useCookies } from "react-cookie";
import MessageInterface from "../../../../../interfaces/Message.interface";
import classes from "./Message.module.css";

const Message: React.FC<{ message: MessageInterface }> = (props) => {
	const [cookies] = useCookies();
	const clientId = jwtDecode<JwtPayload>(cookies.Authentication).sub;

	return (
		<div
			className={
				props.message.user.userId === clientId
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
			<div className={classes.message}>{props.message.message}</div>
		</div>
	);
};

export default Message;
