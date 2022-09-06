import { useContext, useEffect, useRef, useState } from "react";
import ChatContext from "../../../context/chat-context";
import { ChatContextType } from "../../../types/ChatContextType";
import MemberList from "./MemberList/MemberList";
import classes from "./ChanContent.module.css";
import ChanForm from "./ChanForm/ChanForm";
import ChanMsgs from "./ChanMsgs/ChanMsgs";
import { socket } from "../../../App";
import MessageInterface from "../../../interfaces/Message.interface";
import { EventEmitter } from "stream";

function ChanContent() {
	const ctx = useContext(ChatContext) as ChatContextType;
	const inputPw = useRef<HTMLInputElement>(null);
	const [msgs, setMsgs] = useState<MessageInterface[]>([]);
	const [authorized, setAuthorized] = useState<boolean>(false);
	const [isBanned, setIsBanned] = useState<boolean>(false);
	const [needPw, setNeedPw] = useState<boolean>(false);

	useEffect(() => {
		socket.emit("getChannelMessages", ctx.activeChan?.title);
		socket.on("sendChannelMessages", (messages) => {
			setAuthorized(true);
			setMsgs(messages);
		});
		socket.on("userIsBanned", () => {
			setAuthorized(false);
			setIsBanned(true);
		});
		socket.on("chanNeedPw", () => {
			setAuthorized(false);
			setNeedPw(true);
		});
	}, [ctx.activeChan]);

	function pwSubmitHandler(event: any) {
		event.preventDefault();
		socket.emit("chanWithPassword", {
			title: ctx.activeChan!.title,
			password: inputPw.current!.value,
		});
		inputPw.current!.value = "";
	}

	if (authorized) {
		if (!ctx.activeChan) return <ChanForm />;
		return (
			<div className={classes.layout}>
				<ChanMsgs msgs={msgs} />
				<MemberList />
			</div>
		);
	} else {
		if (isBanned) return <div>User in unauthorized</div>;
		else if (needPw)
			return (
				<form onSubmit={pwSubmitHandler} className={classes.pw_form}>
					<input ref={inputPw} type="password" placeholder="Enter a password" />
					<button>Send</button>
				</form>
			);
	}
}

export default ChanContent;
