import { useContext } from "react";
import ChatContext from "../../../context/chat-context";
import { ChatContextType } from "../../../types/ChatContextType";
import MemberList from "./MemberList/MemberList";
import classes from "./ChanContent.module.css";
import ChanForm from "./ChanForm/ChanForm";
import ChanMsgs from "./ChanMsgs/ChanMsgs";

function ChanContent() {
	const ctx = useContext(ChatContext) as ChatContextType;

	if (!ctx.activeChan) return <ChanForm />;
	return (
		<div className={classes.layout}>
			<ChanMsgs />
			<MemberList />
		</div>
	);
}

export default ChanContent;
