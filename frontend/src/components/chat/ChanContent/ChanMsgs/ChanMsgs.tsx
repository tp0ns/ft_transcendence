import jwtDecode, { JwtPayload } from "jwt-decode";
import { useContext, useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { socket } from "../../../../App";
import ChatContext from "../../../../context/chat-context";
import ChannelInterface from "../../../../interfaces/Channel.interface";
import MessageInterface from "../../../../interfaces/Message.interface";
import classes from "./ChanMsgs.module.css";
import ChanSettings from "./ChanSettings/ChanSettings";
import Message from "./Message/Message";

function ChanMsgs() {
	const ctx = useContext(ChatContext);
	const [chan, setChan] = useState<ChannelInterface>();
	const [msgs, setMsgs] = useState<MessageInterface[]>([]);
	const [settings, setSettings] = useState<boolean>(false);
	const msg = useRef<HTMLInputElement>(null);

	useEffect(() => {
		socket.emit("getChanByName", ctx.activeChan);
		socket.emit("getChannelMessages", ctx.activeChan);

		socket.on("sendChannel", (channel) => {
			setChan(channel);
		});
		socket.on("sendChannelMessages", (messages) => {
			setMsgs(messages);
		});
	}, [ctx.activeChan]);

	function settingsClickHandler() {
		setSettings((prev) => {
			return !prev;
		});
	}

	function msgSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
		socket.emit("msgToChannel", msg.current?.value, ctx.activeChan);
		msg.current!.value = "";
	}

	return (
		<div className={classes.layout}>
			<div className={classes.title}>
				<div>{chan?.title}</div>
				<div onClick={settingsClickHandler} className={classes.settings}>
					<img src="settings-chat.svg" alt="settings" />
				</div>
				{settings ? <ChanSettings onClick={settingsClickHandler} /> : null}
			</div>
			<div className={classes.msgs}>
				{msgs.map((msg) => {
					return <Message key={msg.message} message={msg} />;
				})}
			</div>
			<form onSubmit={msgSubmitHandler} className={classes.msg_form}>
				<input ref={msg} type="text" placeholder="Enter a message" />
				<button>Send</button>
			</form>
		</div>
	);
}

export default ChanMsgs;
