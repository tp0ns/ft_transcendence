import { useContext } from "react";
import ChatContext from "../../../context/chat-context";
import classes from "./ChanContent.module.css";
import ChanForm from "./ChanForm/ChanForm";
import ChanMsgs from "./ChanMsg/ChanMsgs";
import ChanSettings from "./ChanSettings/ChanSettings";

function ChanContent() {
	const ctx = useContext(ChatContext);

	if (ctx.activeChan === "") return <ChanForm />;
	return (
		<div className={classes.layout}>
			<ChanMsgs />
			<ChanSettings />
		</div>
	);
}

export default ChanContent;
