import { useContext, useEffect, useRef, useState } from "react";
import { socket } from "../../../../App";
import ChatContext from "../../../../context/chat-context";
import ChannelInterface from "../../../../interfaces/Channel.interface";
import MessageInterface from "../../../../interfaces/Message.interface";
import { ChatContextType } from "../../../../types/ChatContextType";
import MemberList from "../MemberList/MemberList";
import classes from "./ChanMsgs.module.css";
import ChanSettings from "./ChanSettings/ChanSettings";
import Message from "./Message/Message";

const ChanMsgs: React.FC<{ msgs: MessageInterface[] }> = (props) => {
	const ctx = useContext(ChatContext) as ChatContextType;
	const bottomScroll = useRef<any>(null);
	const [settings, setSettings] = useState<boolean>(false);
	const inputMsg = useRef<HTMLInputElement>(null);

	useEffect(() => {
		bottomScroll.current?.scrollIntoView({ behavior: "smooth" });
	}, [props.msgs]);

	function settingsClickHandler() {
		setSettings((prev) => {
			return !prev;
		});
	}

	function msgSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
		socket.emit("msgToChannel", inputMsg.current?.value, ctx.activeChan!.title);
		inputMsg.current!.value = "";
	}

	return (
		<div className={classes.layout}>
			<div className={classes.title}>
				<div>{ctx.activeChan!.title}</div>
				{ctx.isAdmin ? (
					<div onClick={settingsClickHandler} className={classes.settings}>
						<img src="settings-chat.svg" alt="settings" />
					</div>
				) : null}
				{settings ? (
					<ChanSettings
						onClick={settingsClickHandler}
						channel={ctx.activeChan as ChannelInterface}
					/>
				) : null}
			</div>
			<div className={classes.msgs}>
				<div ref={bottomScroll} />
				{props.msgs
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
};

export default ChanMsgs;
