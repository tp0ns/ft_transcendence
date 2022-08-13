import { useEffect, useState } from "react";
import ChannelsList from "../../components/channel/ChannelsLists";
import NewChannelForm from "../../components/channel/NewChannel";
import ChannelProp from "../../interfaces/Channel.interface";
import OpenedChannel from "../../components/channel/OpenedChannel";
import Settings from "../../components/channel/Settings";
import { socket } from "../../App";
import classes from "./ChatPage.module.css";
import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import ChannelMembersList from "../../components/channel/ChannelMembersList";
import { ChatContextProvider } from "../../context/chat-context";

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
		console.log("entered useEffect");
		socket.emit("getMemberChannels");
		socket.on("sendMemberChannels", (channels) => {
			setChannelsReceived(channels);
		});
		console.log("NewChannel", channelsReceived);
	}, [newChannel]);

	useEffect(() => {
		socket.emit("getMemberChannels");
		socket.on("sendMemberChannels", (channels) => {
			setChannelsReceived(channels);
			setOpenedChannel(channels[0]);
		});
		console.log("First render", channelsReceived);
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
		console.log("entered sendChan");
		console.log("Channel Data in chat page: ", channelData);
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
		console.log("channel in settings handler: ", channel);
		setSettings(channel);
	};

	useEffect(() => {
		console.log("channelSettings in useEffect: ", channelSettings);
	}, [channelSettings]);

	return (
		<React.Fragment>
			<NavBar />
			<ChatContextProvider>
				<div className={classes.layout}>
					<div className={classes.channel_list}>list</div>
					<div className={classes.channel_content}>content</div>
				</div>
			</ChatContextProvider>
		</React.Fragment>
	);
}

export default ChatPage;
