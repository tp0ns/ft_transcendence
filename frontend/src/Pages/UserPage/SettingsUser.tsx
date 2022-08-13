import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseJsonSourceFileConfigFileContent } from "typescript";
import UserProp from "../../interfaces/User.interface";
import classes from "./SettingsUser.module.css";

const SettingsUser: React.FC<{
	user: UserProp;
	onUserchange: (newUser: UserProp) => void;
}> = (props) => {
	const nameInput = useRef<HTMLInputElement>(null);
	const navigate: any = useNavigate();
	const [twofa, settwofa] = useState<boolean>(props.user.isTwoFAEnabled);
	const [qrcode, setqrcode] = useState<any>([]);
	const [twoFAForm, settwoFAForm] = useState<boolean>(false);
	const twoFAInput = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!twoFAForm) return;
		async function getQrCode() {
			const response = await fetch("/backend/auth/2fa/generate");
			const data = await response.json();
			setqrcode(data);
		}
		getQrCode();
	}, [twoFAForm]);

	useEffect(() => {
		if (props.user.isTwoFAEnabled) {
			settwoFAForm(false);
			settwofa(true);
		}
	}, [props.user]);

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

	async function pictureSubmitHandler(event: any) {
		event.preventDefault();
		let file = new FormData();
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

	async function twoFASubmitHandler(event: any) {
		event.preventDefault();
		try {
			const response: UserProp = await (
				await fetch("http://localhost/backend/auth/2fa/turn-on", {
					method: "POST",
					headers: {
						"Content-type": "application/json; charset=UTF-8",
					},
					body: JSON.stringify({
						twoFACode: twoFAInput.current?.value,
					}),
				})
			).json();
			props.onUserchange(response);
			twoFAInput.current!.value = "";
		} catch (err) {
			console.log(err);
		}
	}

	async function disableTwoFA() {
		try {
			const response: UserProp = await (
				await fetch("http://localhost/backend/auth/2fa/turn-off", {
					method: "POST",
				})
			).json();
			props.onUserchange(response);
			settwofa(false);
		} catch (err) {
			console.log(err);
		}
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
			<form
				onSubmit={nameSubmitHandler}
				className={classes.form_name}
				autoComplete="off"
			>
				<label htmlFor="text">New nickname</label>
				<input ref={nameInput} type="text" id="text"></input>
				<button>Save</button>
			</form>
			<form onSubmit={pictureSubmitHandler} className={classes.form_avatar}>
				<label htmlFor="avatar">New profile picture</label>
				<input type="file" id="avatar" />
				<button>Save</button>
			</form>
			<div className={classes.form_2fa}>
				<p>2FA Authentication</p>
				{twofa ? (
					<button onClick={disableTwoFA}>Disable 2FA Authentication</button>
				) : null}
				{!twofa && !twoFAForm ? (
					<button
						onClick={() => {
							settwoFAForm(true);
						}}
					>
						Activate 2FA Authentication
					</button>
				) : null}
				{twoFAForm && !twofa ? (
					<form
						onSubmit={twoFASubmitHandler}
						className={classes.form_avatar}
						autoComplete="off"
					>
						<label htmlFor="twofa">
							<img src={qrcode.qr} alt="qr code for 2fa" />
							<p className={classes.secret}>{qrcode.secret}</p>
						</label>
						<input ref={twoFAInput} type="text" id="twofa" />
						<button>Submit</button>
					</form>
				) : null}
			</div>
			<div className={classes.logout} onClick={logout}>
				Logout
			</div>
		</div>
	);
};

export default SettingsUser;
