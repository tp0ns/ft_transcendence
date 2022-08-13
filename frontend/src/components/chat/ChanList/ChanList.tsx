import { useContext, useEffect, useState } from "react";
import { socket } from "../../../App";
import ChatContext from "../../../context/chat-context";
import classes from "./ChanList.module.css";

function ChanList() {
	const [channels, setChannels] = useState([]);
	const ctx = useContext(ChatContext);

	useEffect(() => {
		socket.emit("getMemberChannels");
	}, channels);

	socket.on("sendMemberChannels", (channels) => {
		setChannels(channels);
	});

	return <div className={classes.layout}>List</div>;
}

export default ChanList;
