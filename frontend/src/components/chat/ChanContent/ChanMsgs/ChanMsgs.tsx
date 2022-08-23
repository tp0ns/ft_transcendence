import { useContext, useEffect, useRef, useState } from "react";
import { socket } from "../../../../App";
import ChatContext from "../../../../context/chat-context";
import MessageInterface from "../../../../interfaces/Message.interface";
import { ChatContextType } from "../../../../types/ChatContextType";
import ChanProtect from "../ChanProtect/ChanProtect";
import classes from "./ChanMsgs.module.css";
import ChanSettings from "./ChanSettings/ChanSettings";
import Message from "./Message/Message";

function ChanMsgs() {
	const ctx = useContext(ChatContext) as ChatContextType;
	const [msgs, setMsgs] = useState<MessageInterface[]>([]);
	// const [connected, setConnected] = useState<boolean>(false);
	const bottomScroll = useRef<any>(null);
	const [settings, setSettings] = useState<boolean>(false);
	const inputMsg = useRef<HTMLInputElement>(null);

	useEffect(() => {
		socket.emit("getChannelMessages", ctx.activeChan?.title);
		socket.on("sendChannelMessages", (messages) => {
			setMsgs(messages);
		});
	}, [ctx.activeChan]);

	useEffect(() => {
		bottomScroll.current?.scrollIntoView({ behavior: "smooth" });
	}, [msgs]);

	function settingsClickHandler() {
		setSettings((prev) => {
			return !prev;
		});
	}

	function msgSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
		socket.emit("msgToChannel", inputMsg.current?.value, ctx.activeChan);
		inputMsg.current!.value = "";
	}

	// function changeConnected() {
	// 	setConnected((prev) => {
	// 		return !prev;
	// 	});
	// }

	// if (ctx.activeChan!.protected && !connected) {
	// 	return (
	// 		<ChanProtect
	// 			title={ctx.activeChan!.title}
	// 			changeConnected={() => {
	// 				changeConnected;
	// 			}}
	// 		/>
	// 	);
	// }

	return (
		<div className={classes.layout}>
			<div className={classes.title}>
				<div>{ctx.activeChan!.title}</div>
				<div onClick={settingsClickHandler} className={classes.settings}>
					<img src="settings-chat.svg" alt="settings" />
				</div>
				{settings ? <ChanSettings onClick={settingsClickHandler} /> : null}
			</div>
			<div className={classes.msgs}>
				<div ref={bottomScroll} />
				{msgs
					.slice()
					.reverse()
					.map((msg) => {
						return <Message key={msg.id} message={msg} />;
					})}
			</div>
			<form onSubmit={msgSubmitHandler} className={classes.msg_form}>
				<input ref={inputMsg} type="text" placeholder="Enter a message" />
				<button>Send</button>
			</form>
		</div>
	);
}

export default ChanMsgs;
