import { useEffect, useState } from "react";
import ChannelProp from "../../interfaces/Channel.interface";
import { socket } from "../../App";
import classes from "./ChatPage.module.css";
import React from "react";
import { ChatContextProvider } from "../../context/chat-context";
import ChanList from "../../components/chat/ChanList/ChanList";
import ChanContent from "../../components/chat/ChanContent";
import Layout from "../../components/Layout/Layout";

function ChatPage() {
	const [newChannel, setNewChannel] = useState(false);
	const [channelsReceived, setChannelsReceived] = useState([]);
	const [channelSettings, setSettings] = useState<ChannelProp | null>(null);
	const [openedChannel, setOpenedChannel] = useState<ChannelProp | null>(null);
	const [messagesChannel, setMessagesChannel] = useState([]);

	const handleNewChannel = () => {
		setNewChannel(true);
		setOpenedChannel(null);
	};

	useEffect(() => {
		//console.log("entered useEffect");
		socket.emit("getMemberChannels");
		socket.on("sendMemberChannels", (channels) => {
			setChannelsReceived(channels);
		});
		//console.log("NewChannel", channelsReceived);
	}, [newChannel]);

	useEffect(() => {
		socket.emit("getMemberChannels");
		socket.on("sendMemberChannels", (channels) => {
			setChannelsReceived(channels);
			setOpenedChannel(channels[0]);
		});
		//console.log("First render", channelsReceived);
	}, []);

	socket.on("updatedChannels", () => {
		socket.emit("getAllChannels");
		socket.on("sendChans", (channels) => {
			setChannelsReceived(channels);
			for (const channel of channels) {
				socket.emit("joinRoom", channel);
			}
		});
	});

	socket.on("updatedDMs", () => {
		socket.emit("getAllChannels");
		socket.on("sendChans", (channels) => {
			setChannelsReceived(channels);
			for (const channel of channels) {
				socket.emit("joinRoom", channel);
			}
		});
	});

	const sendChannel = (channelData: ChannelProp) => {
		//console.log("entered sendChan");
		//console.log("Channel Data in chat page: ", channelData);
		socket.emit("createChan", channelData);
		setNewChannel(false);
	};

	const handleOpenedChannel = (channel: ChannelProp) => {
		// socket.emit("joinRoom", channel);
		socket.emit("getChannelMessages");
		socket.on("sendChannelMessages", (messages) => {
			setMessagesChannel(messages);
		});
		setOpenedChannel(channel);
		setNewChannel(false);
	};

	const leaveChannelHandler = () => {
		socket.emit("leaveRoom");
		setOpenedChannel(null);
	};

	const settingsHandler = (channel: ChannelProp) => {
		//console.log("channel in settings handler: ", channel);
		setSettings(channel);
	};

	useEffect(() => {
		//console.log("channelSettings in useEffect: ", channelSettings);
	}, [channelSettings]);

	return (
		<Layout>
			<ChatContextProvider>
				<div className={classes.layout}>
					<ChanList />
					<ChanContent />
				</div>
			</ChatContextProvider>
		</Layout>
	);
}

export default ChatPage;
