import { useEffect, useRef } from "react";
import { socket } from "../../../../App";
import classes from "./ChanProtect.module.css";

const ChanProtect: React.FC<{
	title: string | undefined;
	changeConnected: () => void;
}> = (props) => {
	const pwRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		socket.on("chanWithPassword", (connected) => {
			if (!connected) return;
			props.changeConnected();
		});
	}, []);

	function pwSubmitHandler() {
		const connect = {
			title: props.title,
			password: pwRef.current?.value,
		};
		socket.emit("chanWithPassword", connect);
	}

	return (
		<div className={classes.layout}>
			<form onSubmit={pwSubmitHandler} autoComplete="off">
				<fieldset>
					<legend>Enter Password</legend>
					<input ref={pwRef} type="password" />
					<button>Connect</button>
				</fieldset>
			</form>
		</div>
	);
};

export default ChanProtect;
