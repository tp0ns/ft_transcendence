import React, { useRef } from "react";
import { useNavigate } from "react-router";
import { classicNameResolver } from "typescript";

const TwoFAPAge = () => {
	const userInput_one = useRef<HTMLInputElement>(null);
	const userInput_two = useRef<HTMLInputElement>(null);
	const userInput_three = useRef<HTMLInputElement>(null);
	const userInput_four = useRef<HTMLInputElement>(null);
	const userInput_five = useRef<HTMLInputElement>(null);
	const userInput_six = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	async function submitHandler(event: React.FormEvent) {
		event.preventDefault();
		if (userInput_one.current?.value === "" ||
				userInput_two.current?.value === "" ||
				userInput_three.current?.value === "" ||
				userInput_four.current?.value === "" ||
				userInput_five.current?.value === "" ||
				userInput_six.current?.value === "") return;
		try {
			const response = await fetch(
				"http://localhost/backend/auth/2fa/authenticate",
				{
					method: "POST",
					headers: {
						"Content-type": "application/json; charset=UTF-8",
					},
					body: JSON.stringify({
						twoFACode: userInput_one.current!.value,
					}),
				}
			);
			if (!response.ok) {
				throw new Error("Request failed!");
			} else {
				navigate("/");
			}
		} catch (err) {
			console.log(err);
		}
		userInput_one.current!.value = "";
		userInput_two.current!.value = "";
		userInput_three.current!.value = "";
		userInput_four.current!.value = "";
		userInput_five.current!.value = "";
		userInput_six.current!.value = "";
	}

	// const numOfFields = 3;

// const handleChange = (event: React.FormEvent) => {
//   const { maxLength, value, name } = event.target;
//   const [fieldName, fieldIndex] = name.split("-");

//   // Check if they hit the max character length
//   if (value.length >= maxLength) {
//     // Check if it's not the last input field
//     if (parseInt(fieldIndex, 10) < 6) {
//       // Get the next input field
//       const nextSibling = document.querySelector(
//         `input[name=ssn-${parseInt(fieldIndex, 10) + 1}]`
//       );

//       // If found, focus the next field
//       if (nextSibling !== null) {
//         nextSibling.focus();
//       }
//     }
//   }
// }

	return (
		<React.Fragment>
			<form onSubmit={submitHandler} className={classes.}>
				<label htmlFor="text">Enter your 2FA code</label>
				<input ref={userInput_one} type="text" id="text" maxLength={1}></input>
				<input ref={userInput_one} type="text" id="text" maxLength={1}></input>
				<input ref={userInput_one} type="text" id="text" maxLength={1}></input>
				<input ref={userInput_one} type="text" id="text" maxLength={1}></input>
				<input ref={userInput_one} type="text" id="text" maxLength={1}></input>
				<input ref={userInput_one} type="text" id="text" maxLength={1}></input>
				<button>Connect</button>
			</form>
		</React.Fragment>
	);
};

export default TwoFAPAge;
