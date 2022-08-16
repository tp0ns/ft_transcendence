import { useEffect } from "react";
import classes from "./ChanMsgs.module.css";

const ChanMsgs: React.FC<{}> = (props) => {
	useEffect(() => {
		
	}, []);

	return (
		<div className={classes.layout}>
			<div className={classes.title}>Title</div>
			<div className={classes.msgs}>Message</div>
			<form className={classes.msg_form}>
				<input type="text" placeholder="Enter a message" />
				<button>Send</button>
			</form>
		</div>
	);
};

export default ChanMsgs;
