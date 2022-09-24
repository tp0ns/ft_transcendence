import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../App";
import Layout from "../../components/Layout/Layout";
import classes from "./HomePage.module.css";

const HomePage: React.FC<{}> = () => {
	const navigate = useNavigate();

	useEffect(() => {
		socket.on("waitingMatchmaking", () => {
			navigate("/waiting");
		});
		socket.on("matchAccepted", (roomId) => {
			socket.emit("joinGame", roomId);
			navigate("/game");
		});
	}, []);

	function startLocalGame() {
		socket.emit("localgame");
		navigate("/game");
	}

	function startMatchmaking() {
		socket.emit("matchmaking");
	}

	return (
		<Layout>
			<div className={classes.fakegame}>
				<div className={classes.title}>PONG</div>
				<div className={classes.buttons}>
					<div className={classes.pad}></div>
					<div
						className={classes.button}
						onClick={() => {
							startLocalGame();
						}}
					>
						LOCAL GAME
					</div>
					<div className={classes.ball}></div>
					<div
						className={classes.button}
						onClick={() => {
							startMatchmaking();
						}}
					>
						MATCHMAKING
					</div>
					<div className={classes.pad}></div>
				</div>
			</div>
		</Layout>
	);
};

export default HomePage;
