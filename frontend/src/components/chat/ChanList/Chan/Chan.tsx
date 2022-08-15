import { useContext } from "react";
import ChatContext from "../../../../context/chat-context";
import ChannelInterface from "../../../../interfaces/Channel.interface";
import classes from "./Chan.module.css";

const Chan: React.FC<{ key: string; chan: ChannelInterface }> = (props) => {
	const ctx = useContext(ChatContext);

	return (
		<button
			className={classes.chan_item}
			onClick={() => {
				ctx.changeActiveChan(props.chan.title);
			}}
		>
			{props.chan.title}
		</button>
	);
};

export default Chan;
