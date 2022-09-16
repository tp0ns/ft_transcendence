import { useContext, useEffect, useRef, useState } from "react";
import ChatContext from "../../../context/chat-context";
import { ChatContextType } from "../../../types/ChatContextType";
import MemberList from "./MemberList/MemberList";
import classes from "./ChanContent.module.css";
import ChanForm from "./ChanForm/ChanForm";
import ChanMsgs from "./ChanMsgs/ChanMsgs";
import { socket } from "../../../App";
import MessageInterface from "../../../interfaces/Message.interface";

function ChanContent() {
	const ctx = useContext(ChatContext) as ChatContextType;
	const inputPw = useRef<HTMLInputElement>(null);
	const [msgs, setMsgs] = useState<MessageInterface[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [isBanned, setIsBanned] = useState<boolean>(false);
	const [needPw, setNeedPw] = useState<boolean>(false);

	useEffect(() => {
		setIsBanned(false);
		setNeedPw(false);
		if (ctx.activeChan) {
			setLoading(true);
			socket.emit("getChannelMessages", ctx.activeChan!.channelId);
			return;
		}
		setLoading(false);
	}, [ctx.activeChan]);

	useEffect(() => {
		socket.on("updatedMessage", () => {
			socket.emit("getChannelMessages", ctx.activeChan!.channelId);
		});
		socket.on("sendChannelMessages", (messages) => {
			setLoading(false);
			setNeedPw(false);
			setIsBanned(false);
			setMsgs(messages);
		});
		socket.on("userIsBanned", () => {
			setLoading(false);
			setIsBanned(true);
		});
		socket.on("chanNeedPw", () => {
			setLoading(false);
			setNeedPw(true);
		});
	}, []);

	function pwSubmitHandler(event: any) {
		event.preventDefault();
		socket.emit("chanWithPassword", {
			id: ctx.activeChan!.channelId,
			password: inputPw.current!.value,
		});
		setLoading(true);
		inputPw.current!.value = "";
	}

	if (loading) return <div className={classes.spin}></div>;
	else if (isBanned)
		return (
			<div className={classes.banned}>
				<img src="/ban.svg" alt="Blocked" />
				<p>You have been banned from this channel</p>
			</div>
		);
	else if (needPw)
		return (
			<form onSubmit={pwSubmitHandler} className={classes.pw_form}>
				<label>Channel Password</label>
				<input ref={inputPw} type="password" placeholder="Enter a password" />
			</form>
		);
	else {
		if (!ctx.activeChan) return <ChanForm />;
		return (
			<div className={classes.layout}>
				<ChanMsgs msgs={msgs} />
				<MemberList />
			</div>
		);
	}
}

export default ChanContent;
