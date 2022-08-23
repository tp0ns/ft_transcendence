import { channel } from "diagnostics_channel";
import React, { useEffect, useState } from "react";
import { socket } from "../App";
import ChannelInterface from "../interfaces/Channel.interface";
import { ChatContextType } from "../types/ChatContextType";

const ChatContext = React.createContext<ChatContextType | null>(null);

export const ChatContextProvider: React.FC<{ children: JSX.Element }> = (
	props
) => {
	const [channels, setChannels] = useState<ChannelInterface[]>([]);
	const [activeChan, setactiveChan] = useState<ChannelInterface | null>(null);

	useEffect(() => {
		socket.emit("getMemberChannels");
		socket.on("updatedChannels", () => {
			socket.emit("getMemberChannels");
		});
		socket.on("sendMemberChans", (channels: ChannelInterface[]) => {
			setChannels(channels);
		});
	}, []);

	useEffect(() => {
		setactiveChan((prevChan) => {
			if (prevChan === null) return prevChan;
			const newActiveChan = channels.find((channel) => {
				return channel.channelId === prevChan!.channelId;
			}) as ChannelInterface;
			return newActiveChan;
		});
	}, [channels]);

	function changeActiveChan(chan: ChannelInterface | null) {
		if (activeChan) socket.emit("leaveRoom", activeChan);
		setactiveChan(chan);
		if (!chan) return;
		socket.emit("joinRoom", chan);
	}

	return (
		<ChatContext.Provider
			value={{
				channels: channels,
				activeChan: activeChan,
				changeActiveChan: changeActiveChan,
			}}
		>
			{props.children}
		</ChatContext.Provider>
	);
};

export default ChatContext;
