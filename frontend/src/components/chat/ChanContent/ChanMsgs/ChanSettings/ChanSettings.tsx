import { useRef } from "react";
import { socket } from "../../../../../App";
import ChannelInterface from "../../../../../interfaces/Channel.interface";
import Modal from "../../../../../ui/Modal/Modal";
import classes from "./ChanSettings.module.css";

const ChanSettings: React.FC<{
	onClick: () => void;
	channel: ChannelInterface;
}> = (props) => {
	const title = useRef<HTMLInputElement>(null);

	function handleModifySubmit() {
		socket.emit("modifyChannel", {
			title: title.current?.value,
		});
	}

	return (
		<Modal
			title="Channel settings"
			onClick={props.onClick}
			className={classes.modal_layout}
		>
			<div className={classes.settings}>
				<form onSubmit={handleModifySubmit}>
					<label htmlFor="title">Change title</label>
					<input type="text" id="title" />
					<button>Save changes</button>
				</form>
			</div>
		</Modal>
	);
};

export default ChanSettings;
