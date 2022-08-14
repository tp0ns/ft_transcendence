import { Reducer, ReducerAction, ReducerState, useReducer } from "react";
import NewChannelI from "../../../../interfaces/newChannel.interface";
import classes from "./ChanForm.module.css";

type ACTIONTYPE = { type: string; val: NewChannelI };

function chanReducer(state: NewChannelI, action: ACTIONTYPE): NewChannelI {
	switch (action.type) {
		case "reset": {
			return action.val;
		}
		case "": {
			return;
		}
		case "": {
			return;
		}
		case "": {
			return;
		}
		case "": {
			return;
		}
		default:
			break;
	}
}

function ChanForm() {
	const [newChan, dispatchChan] = useReducer(chanReducer, {
		id: "",
		title: "",
		private: false,
		protected: false,
		password: "",
	});

	function chanSubmitHandler(event: any) {
		console.log(newChan);
	}

	return (
		<form
			onSubmit={chanSubmitHandler}
			className={classes.form}
			autoComplete="off"
		>
			<label htmlFor="name">Channel Name</label>
			<input type="text" id="name" />
			<label htmlFor="name">Public</label>
			<input
				type="checkbox"
				id="privacy"
				onChange={() => {
					console.log("privacy");
				}}
			/>
			<label htmlFor="name">Protect with password</label>
			<input
				type="checkbox"
				id="protection"
				onChange={() => {
					console.log("protection");
				}}
			/>
			<button className={classes.button}>Create Channel</button>
		</form>
	);
}

export default ChanForm;
