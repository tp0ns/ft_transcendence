import { useContext, useEffect, useState } from "react";
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
	const [msgs, setMsgs] = useState<MessageInterface[]>([]);
	const [authorized, setAuthorized] = useState<boolean>(true);
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
		else if (needPw) return <div>User need to provide a password</div>;
	}
}

export default ChanContent;
