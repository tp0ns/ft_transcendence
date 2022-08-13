import { useContext } from "react";
import ChatContext from "../../../context/chat-context";
import classes from "./ChanContent.module.css";
import ChanForm from "./ChanForm/ChanForm";
import ChanSettings from "./ChanSettings/ChanSettings";

function ChanContent() {
	const ctx = useContext(ChatContext);

	if (ctx.activeChan === "new_chan")
		return (
			<div className={classes.form_layout}>
				<ChanForm />
			</div>
		);
	return (
		<div className={classes.layout}>
			<div>Messages</div>
			<ChanSettings />
		</div>
	);
}

export default ChanContent;
