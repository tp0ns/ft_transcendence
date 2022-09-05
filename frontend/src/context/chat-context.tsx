import jwtDecode, { JwtPayload } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { socket } from "../App";
import ChannelInterface from "../interfaces/Channel.interface";
import { ChatContextType } from "../types/ChatContextType";

const ChatContext = React.createContext<ChatContextType | null>(null);

export const ChatContextProvider: React.FC<{ children: JSX.Element }> = (
	props
) => {
	const [channels, setChannels] = useState<ChannelInterface[]>([]);
	const [activeChan, setactiveChan] = useState<ChannelInterface | null>(null);
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [cookies] = useCookies();
	const clientId = jwtDecode<JwtPayload>(cookies.Authentication).sub as string;

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
			changeIsAdmin(newActiveChan);
			return newActiveChan;
		});
	}, [channels]);

	function changeIsAdmin(chan: ChannelInterface | null) {
		if (!chan) return;
		const isAdmin: boolean = chan!.admins.some((admin) => {
			return admin.userId === clientId;
		});
		if (isAdmin) {
			setIsAdmin(true);
		} else {
			setIsAdmin(false);
		}
	}

	function changeActiveChan(chan: ChannelInterface | null) {
		if (activeChan) socket.emit("leaveRoom", activeChan);
		setactiveChan(chan);
		changeIsAdmin(chan);
		if (!chan) return;
		socket.emit("joinRoom", chan);
	}

	return (
		<ChatContext.Provider
			value={{
				channels: channels,
				activeChan: activeChan,
				isAdmin: isAdmin,
				clientId: clientId,
				changeActiveChan: changeActiveChan,
			}}
		>
			{props.children}
		</ChatContext.Provider>
	);
};

export default ChatContext;
