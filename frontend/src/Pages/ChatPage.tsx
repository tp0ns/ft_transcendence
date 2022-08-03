import ReactDOM from "react-dom";
import { io, Socket } from "socket.io-client";
import React, { useEffect, useState } from "react";
import ChannelsList from "../components/ChannelsLists";
import NewChannelForm from "../components/NewChannel";
import ChannelProp from "../interfaces/Channel.interface";
import OpenedChannel from "../components/OpenedChannel";
import NavBar from "../components/NavBar/NavBar";

const socket: Socket = io("http://localhost");

function ChatPage() {
	const [newChannel, setNewChannel] = useState(false);
	const [channelsReceived, setChannelsReceived] = useState([]);
	const [openedChannel, setOpenedChannel] = useState<ChannelProp | null>(null);

	const handleNewChannel = () => {
		setNewChannel(true);
	};

	useEffect(() => {
		console.log("entered useEffect");
		socket.emit("getAllChannels");
		socket.on("sendChans", (channels) => {
			setChannelsReceived(channels);
		});
	}, [newChannel]);

	const sendChannel = (channelData: ChannelProp) => {
		console.log("entered sendChan");
		console.log("Channel Data in chat page: ", channelData);
		socket.emit("createChan", channelData);
		setNewChannel(false);
	};

	const handleOpenedChannel = (channel: any) => {
		socket.emit("joinRoom", channel);
		setOpenedChannel(channel);
	};

	const leaveChannelHandler = () => {
		socket.emit("leaveRoom");
		setOpenedChannel(null);
	};

	return (
		<React.Fragment>
			{ReactDOM.createPortal(
				<NavBar />,
				document.getElementById("navbar-root") as Element
			)}
			<section>
				{!newChannel ? (
					<button onClick={handleNewChannel}>Add Channel</button>
				) : null}
				<ChannelsList
					selectedChannel={handleOpenedChannel}
					channels={channelsReceived}
				/>
				{newChannel && !openedChannel ? (
					<NewChannelForm sendChan={sendChannel} />
				) : null}
				{!newChannel && openedChannel ? (
					<OpenedChannel
						channel={openedChannel}
						socket={socket}
						leaveChannel={leaveChannelHandler}
					/>
				) : null}
			</section>
		</React.Fragment>
	);
}

export default ChatPage;
