import { useContext } from "react";
import ChatContext from "../../../../../context/chat-context";
import ChannelInterface from "../../../../../interfaces/Channel.interface";
import { ChatContextType } from "../../../../../types/ChatContextType";
import classes from "./Chan.module.css";

const Chan: React.FC<{ key: string; chan: ChannelInterface }> = (props) => {
	const ctx = useContext(ChatContext) as ChatContextType;

	return (
		<button
			className={classes.chan_item}
			onClick={() => {
				ctx.changeActiveChan(props.chan);
			}}
		>
			{props.chan.title}
		</button>
	);
};

export default Chan;
