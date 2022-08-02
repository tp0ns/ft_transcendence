import { useRef, useState } from "react";
import ChannelProp from "../interfaces/Channel.interface";

import Card from "../ui/Card";
// import classes from "./NewChannelForm.module.css";

const NewChannelForm: React.FC<{
	sendChan: (channelData: ChannelProp) => void;
}> = (props: any) => {
	const titleInputRef = useRef<HTMLInputElement>(null);
	const passwordInputRef = useRef<HTMLInputElement>(null);
	const [privateChan, setPrivateChan] = useState(false);
	const [protectedChan, setProtectedChan] = useState(false);

	function submitHandler(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const enteredTitle: string = titleInputRef.current!.value;
		let enteredPassword: string = "123";
		if (passwordInputRef.current) {
			enteredPassword = passwordInputRef.current!.value;
		}

		const channelData = {
			id: "",
			title: enteredTitle,
			password: enteredPassword,
			private: privateChan,
			protected: protectedChan,
		};
		// channelsCtx.addChannel(channelData);
		props.sendChan(channelData);
	}

	function handlePrivate(event: any) {
		event.preventDefault();
		setPrivateChan((prevState) => {
			return !prevState;
		});
	}

	function handleProtected(event: any) {
		event.preventDefault();
		setProtectedChan((prevState) => {
			return !prevState;
		});
	}

	return (
		<Card>
			<form onSubmit={submitHandler}>
				<div>
					<label htmlFor="title">Channel Title</label>
					<input type="text" required id="title" ref={titleInputRef} />
				</div>
				<div>
					<button onClick={handleProtected}>
						{!protectedChan ? "Protect" : "Unprotect"}
					</button>
				</div>
				{protectedChan ? (
					<div>
						<label htmlFor="image">Channel Password</label>
						<input type="text" required id="image" ref={passwordInputRef} />
					</div>
				) : null}
				<div>
					<button onClick={handlePrivate}>
						{!privateChan ? "Make private" : "Make public"}
					</button>
				</div>

				<div>
					<button>Add Channel</button>
				</div>
			</form>
		</Card>
	);
};

export default NewChannelForm;
