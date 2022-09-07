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
		socket.emit("getChannelMessages", ctx.activeChan?.title);
	}, [ctx.activeChan]);

	useEffect(() => {
		socket.on("sendChannelMessages", (messages) => {
			setLoading(false);
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
			title: ctx.activeChan!.title,
			password: inputPw.current!.value,
		});
		inputPw.current!.value = "";
	}

	if (loading) return <div> Loading Chan ... </div>;
	else if (isBanned) return <div>User in unauthorized</div>;
	else if (needPw)
		return (
			<form onSubmit={pwSubmitHandler} className={classes.pw_form}>
				<label>Channel Password :</label>
				<input ref={inputPw} type="password" placeholder="Enter a password" />
				<button>Send</button>
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
	// if (authorized) {
	// 	if (!ctx.activeChan) return <ChanForm />;
	// 	return (
	// 		<div className={classes.layout}>
	// 			<ChanMsgs msgs={msgs} />
	// 			<MemberList />
	// 		</div>
	// 	);
	// } else {
	// 	if (isBanned) return <div>User in unauthorized</div>;
	// 	else if (needPw)
	// 		return (
	// 			<form onSubmit={pwSubmitHandler} className={classes.pw_form}>
	// 				<label>Channel Password :</label>
	// 				<input ref={inputPw} type="password" placeholder="Enter a password" />
	// 				<button>Send</button>
	// 			</form>
	// 		);
	// }
}

export default ChanContent;
