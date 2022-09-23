import React, { useContext, useRef } from "react";
import { useNavigate } from "react-router";
import ErrorContext from "../../../context/error-context";
import classes from "./TwoFAPage.module.css";

const TwoFAPAge = () => {
	const userInput = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();
	const ctx_error = useContext(ErrorContext);

	async function submitHandler(event: React.FormEvent) {
		event.preventDefault();
		const response = await fetch("/backend/auth/2fa/authenticate", {
			method: "POST",
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
			body: JSON.stringify({
				twoFACode: userInput.current!.value,
			}),
		});
		if (!response.ok) {
			userInput.current!.value = "";
			return ctx_error?.changeError("2FA code is invalid");
		} else {
			userInput.current!.value = "";
			navigate(0);
		}
	}

	return (
		<React.Fragment>
			<form onSubmit={submitHandler} className={classes.form}>
				<label htmlFor="text">Enter your verification code</label>
				<input ref={userInput} type="text" id="text" maxLength={6}></input>
				<button>Connect</button>
			</form>
		</React.Fragment>
	);
};

export default TwoFAPAge;
