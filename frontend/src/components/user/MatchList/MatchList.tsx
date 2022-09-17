import { useEffect, useState } from "react";
import { socket } from "../../../App";
import classes from "./MatchList.module.css";

const MatchList: React.FC<{ userId: string }> = (props) => {
	const [current, setCurrent] = useState<string | null>(null);

	useEffect(() => {
		socket.emit("getCurrentMatch", props.userId);
		socket.emit("getMatchHistory", props.userId);
		socket.on("endGame", () => {
			socket.emit("getCurrentMatch", props.userId);
			socket.emit("getMatchHistory", props.userId);
		});
	}, [props.userId]);

	useEffect(() => {
		socket.on("sendCurrentMatch", (currentMatch) => {
			console.log(currentMatch);
			setCurrent(currentMatch);
		});
		socket.on("sendMatchHistory", (matchHistory) => {
			console.log(matchHistory);
		});
	}, []);

	return (
		<div className={classes.matches_layout}>
			{current ? <div className={classes.spectate}>Watch</div> : null}
			<h1 className={classes.matches_title}>Match History</h1>
		</div>
	);
};

export default MatchList;
