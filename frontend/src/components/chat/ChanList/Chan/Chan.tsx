import { useContext } from "react";
import ChatContext from "../../../../context/chat-context";
import ChannelInterface from "../../../../interfaces/Channel.interface";

const Chan: React.FC<{ key: string; chan: ChannelInterface }> = (props) => {
	const ctx = useContext(ChatContext);

	return (
		<button
			onClick={() => {
				ctx.changeActiveChan(props.chan.title);
			}}
		>
			{props.chan.title}
		</button>
	);
};

export default Chan;
