import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserProp from "../../interfaces/User.interface";
import classes from "./SettingsUser.module.css";
import UserPage from "./UserPage";

const SettingsUser: React.FC<{
	user: UserProp | undefined;
	onUserchange: (newUser: UserProp) => void;
}> = (props) => {
	const nameInput = useRef<HTMLInputElement>(null);
	const navigate: any = useNavigate();

	async function nameSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
		if (!nameInput.current?.value) return;
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

	// function onFileChange(event: React.FormEvent) {
	// 	const target = event.target as HTMLInputElement;
	// 	file = target.files[0];
	// }

	async function pictureSubmitHandler(event: any) {
		event.preventDefault();

		var file = new FormData();
		file.append("file", event.target[0].files[0]);
		if (file === null) return;
		const response = await (
			await fetch("http://localhost/backend/users/upload", {
				method: "POST",
				body: file,
			})
		).json();
		props.onUserchange(response);
	}

	async function logout() {
		try {
			const response = await await fetch(
				"http://localhost/backend/auth/logout"
			);
			if (!response.ok) throw new Error("Request failed!");
			else navigate("/login");
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div className={classes.list}>
			{/* <label className={classes.switch}>
				<input type="checkbox" />
				<span className={`${classes.slider} ${classes.round}`}></span>
			</label> */}
			<form onSubmit={nameSubmitHandler} className={classes.form_name}>
				<label htmlFor="text">New nickname</label>
				<input ref={nameInput} type="text" id="text"></input>
				<button>Save</button>
			</form>
			<form onSubmit={pictureSubmitHandler} className={classes.form_image}>
				<label htmlFor="image">New profile picture</label>
				<input type="file" id="image"></input>
				<button>Save</button>
			</form>
			<form className={classes.form_2fa}>
				<label htmlFor="2fa">Set Two Authentification Factor</label>
				<input type="text" id="2fa"></input>
				<button>Save</button>
			</form>
			<div className={classes.logout} onClick={logout}>
				Logout
			</div>
		</div>
	);
};

export default SettingsUser;
