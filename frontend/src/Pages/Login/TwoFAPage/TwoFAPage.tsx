import React, { useRef } from "react";
import { useNavigate } from "react-router";
import classes from "./TwoFAPage.module.css";

const TwoFAPAge = () => {
	const userInput = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	async function submitHandler(event: React.FormEvent) {
		event.preventDefault();
		if (userInput.current?.value === "") return;
		try {
			const response = await fetch(
				"http://localhost/backend/auth/2fa/authenticate",
				{
					method: "POST",
					headers: {
						"Content-type": "application/json; charset=UTF-8",
					},
					body: JSON.stringify({
						twoFACode: userInput.current!.value,
					}),
				}
			);
			if (!response.ok) {
				throw new Error("Request failed!");
			} else {
				userInput.current!.value = "";
				navigate(0);
			}
		} catch (err) {
			console.log(err);
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