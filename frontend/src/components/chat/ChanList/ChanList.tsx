import { SocketAddress } from "net";
import { useContext, useEffect, useState } from "react";
import { isPropertySignature } from "typescript";
import { socket } from "../../../App";
import ChatContext from "../../../context/chat-context";
import ChannelInterface from "../../../interfaces/Channel.interface";
import { ChatContextType } from "../../../types/ChatContextType";
import Chan from "./Chan/Chan";
import classes from "./ChanList.module.css";

function ChanList() {
	const ctx = useContext(ChatContext) as ChatContextType;

	return (
		<div className={classes.layout}>
			<button
				onClick={() => {
					ctx.changeActiveChan(null);
				}}
				className={classes.new_chan}
			>
				+
			</button>
			<div className={classes.chan_list}>
				{ctx.channels.length === 0 ? <div>You have no channels yet</div> : null}
				{ctx.channels.map((chan) => {
					return <Chan key={chan.channelId} chan={chan} />;
				})}
			</div>
		</div>
	);
}

export default ChanList;
