import { useContext, useEffect, useState } from "react";
import { socket } from "../../../App";
import ChatContext from "../../../context/chat-context";
import classes from "./ChanList.module.css";

function ChanList() {
	const [channels, setChannels] = useState([]);
	const ctx = useContext(ChatContext);

	useEffect(() => {
		console.log("hi there im asking for channels");
		socket.emit("getMemberChannels");
		socket.on("sendMemberChans", (channels) => {
			setChannels(channels);
		});
	}, []);

	return (
		<div className={classes.layout}>
			<button
				onClick={() => {
					ctx.changeActiveChan("new_chan");
				}}
				className={classes.new_chan}
			>
				+
			</button>
		</div>
	);
}

export default ChanList;
