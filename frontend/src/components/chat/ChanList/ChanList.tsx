import { SocketAddress } from "net";
import { useContext, useEffect, useState } from "react";
import { isPropertySignature } from "typescript";
import { socket } from "../../../App";
import ChatContext from "../../../context/chat-context";
import ChannelInterface from "../../../interfaces/Channel.interface";
import Chan from "./Chan/Chan";
import classes from "./ChanList.module.css";

function ChanList() {
	const [channels, setChannels] = useState<ChannelInterface[]>([]);
	const ctx = useContext(ChatContext);

	useEffect(() => {
		socket.emit("getMemberChannels");
		socket.on("updatedChannels", () => {
			socket.emit("getMemberChannels");
		});
		socket.on("sendMemberChans", (channels) => {
			console.log(channels);
			setChannels(channels);
		});
	}, []);

	return (
		<div className={classes.layout}>
			<button
				onClick={() => {
					ctx.changeActiveChan("");
				}}
				className={classes.new_chan}
			>
				+
			</button>
			<div className={classes.chan_list}>
				{channels.length === 0 ? <div>You have no channels yet</div> : null}
				{channels.map((chan) => {
					return <Chan key={chan.channelId} chan={chan} />;
				})}
			</div>
		</div>
	);
}

export default ChanList;
