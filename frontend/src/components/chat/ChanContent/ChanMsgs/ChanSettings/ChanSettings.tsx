import React, { useContext, useEffect, useRef, useState } from "react";
import { socket } from "../../../../../App";
import ChatContext from "../../../../../context/chat-context";
import ChannelInterface from "../../../../../interfaces/Channel.interface";
import Modal from "../../../../../ui/Modal/Modal";
import classes from "./ChanSettings.module.css";

const ChanSettings: React.FC<{
	onClick: () => void;
	channel: ChannelInterface;
}> = (props) => {
	const ctx = useContext(ChatContext);
	const protection = useRef<HTMLInputElement>(null);
	const [pwForm, setPwForm] = useState<boolean>(ctx!.activeChan!.protected);
	const password = useRef<HTMLInputElement>(null);

	useEffect(() => {
		protection.current!.checked = ctx!.activeChan!.protected;
	}, [ctx?.activeChan]);

	function handleModifySubmit(event: React.FormEvent) {
		event.preventDefault();
		const modifyChan = {
			title: ctx?.activeChan!.title,
			newPassword: password.current?.value,
			protected: protection.current!.checked,
		};
		socket.emit("modifyChannel", modifyChan);
		props.onClick();
	}

	return (
		<Modal
			title="Channel settings"
			onClick={props.onClick}
			className={classes.modal_layout}
		>
			<form onSubmit={handleModifySubmit} className={classes.settings}>
				<label htmlFor="protection">Protect with password</label>
				<input
					type="checkbox"
					id="protection"
					ref={protection}
					onChange={() => {
						setPwForm((prev) => {
							return !prev;
						});
					}}
				/>
				{pwForm ? (
					<React.Fragment>
						<label htmlFor="pw">Set new password :</label>
						<input type="password" id="pw" ref={password} />
					</React.Fragment>
				) : null}
				<button>Save changes</button>
			</form>
		</Modal>
	);
};

export default ChanSettings;
