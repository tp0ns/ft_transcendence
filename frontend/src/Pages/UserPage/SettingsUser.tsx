import React, { useRef } from "react";
import UserProp from "../../interfaces/User.interface";
import classes from "./SettingsUser.module.css";
import UserPage from "./UserPage";

const SettingsUser: React.FC<{
	user: UserProp | undefined;
	onUserchange: (newUser: UserProp) => void;
}> = (props) => {
	const nameInput = useRef<HTMLInputElement>(null);

	async function nameSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
		const response = await (
			await fetch("http://localhost/backend/users/updateUsername", {
				method: "PUT",
				headers: {
					"Content-type": "application/json; charset=UTF-8",
				},
				body: JSON.stringify({
					username: nameInput.current!.value,
				}),
			})
		).json();
		props.onUserchange(response);
		nameInput.current!.value = "";
	}

	return (
		<div className={classes.list}>
			{/* <label className={classes.switch}>
				<input type="checkbox" />
				<span className={`${classes.slider} ${classes.round}`}></span>
			</label> */}

			<form onSubmit={nameSubmitHandler} className={classes.form_name}>
				{/* <div className={classes.form_content}> */}
				<label htmlFor="text">Enter a new nickname</label>
				<input ref={nameInput} type="text" id="text"></input>
				<button>Save</button>
				{/* </div> */}
			</form>
		</div>
	);
};

export default SettingsUser;
