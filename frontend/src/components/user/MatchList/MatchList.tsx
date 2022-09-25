import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../App";
import MatchHistoryInterface from "../../../interfaces/MatchHistory.interface";
import MatchItem from "./MatchItem/MatchItem";
import classes from "./MatchList.module.css";

const MatchList: React.FC<{ userId: string }> = (props) => {
	const [current, setCurrent] = useState<boolean>(false);
	const [history, setHistory] = useState<MatchHistoryInterface[]>();
	const navigate = useNavigate();

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
			setCurrent(currentMatch);
		});
		socket.on("sendMatchHistory", (matchHistory) => {
			setHistory(matchHistory);
		});
	}, []);

	function spectate() {
		socket.emit("spectate", props.userId);
		navigate("/game");

	}

	return (
		<div className={classes.matches_layout}>
			<h1 className={classes.matches_title}>Match History</h1>
			{current ? (
				<div
					className={classes.spectate}
					onClick={() => {
						spectate();
					}}
				>
					<img src="/spectate.svg" alt="spectate" className={classes.logo} />
					Spectate Match
				</div>
			) : null}
			{history?.length === 0 ? (
				<p className={classes.nomatch}>No games yet</p>
			) : null}
			{history?.map((match) => {
				return <MatchItem key={match.id} match={match} />;
			})}
		</div>
	);
};

export default MatchList;
