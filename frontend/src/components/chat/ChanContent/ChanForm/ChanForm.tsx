import React, { useRef, useState } from "react";
import { socket } from "../../../../App";
import classes from "./ChanForm.module.css";

function ChanForm() {
	const name = useRef<HTMLInputElement>(null);
	const privacy = useRef<HTMLInputElement>(null);
	const protection = useRef<HTMLInputElement>(null);
	const [pwForm, setPwForm] = useState<boolean>(false);
	const password = useRef<HTMLInputElement>(null);

	function chanSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
		const newChan = {
			id: "",
			title: name.current?.value,
			private: privacy.current?.checked,
			protected: protection.current?.checked,
			password: password.current?.value ? password.current!.value : "",
		};
		socket.emit("createChan", newChan);
		name.current!.value = "";
		privacy.current!.checked = false;
		setPwForm(false);
		protection.current!.checked = false;
	}

	return (
		<form
			onSubmit={chanSubmitHandler}
			className={classes.form}
			autoComplete="off"
		>
			<label htmlFor="name">Channel Name</label>
			<input type="text" id="name" ref={name} />
			<label htmlFor="privacy">Private</label>
			<input type="checkbox" id="privacy" ref={privacy} />
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
					<label htmlFor="pw">Enter password :</label>
					<input type="password" id="pw" ref={password} />
				</React.Fragment>
			) : null}
			<button className={classes.button}>Create Channel</button>
		</form>
	);
}

export default ChanForm;
