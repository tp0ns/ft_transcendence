import { useContext } from "react";
import { isPropertySignature } from "typescript";
import ChatContext from "../../../context/chat-context";
import classes from "./ChanContent.module.css";
import ChanForm from "./ChanForm/ChanForm";
import ChanMsgs from "./ChanMsgs/ChanMsgs";

function ChanContent() {
	const ctx = useContext(ChatContext);

	if (ctx.activeChan === "") return <ChanForm />;
	return (
		<div className={classes.layout}>
			<ChanMsgs />
			{/* <div>Users list</div> */}
			{/* <ChanSettings /> */}
		</div>
	);
}

export default ChanContent;
