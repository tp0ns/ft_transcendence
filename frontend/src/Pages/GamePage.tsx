import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Navigate, useNavigate } from "react-router-dom";
import { socket } from "../App";
import GameCanvas from "../components/game/GameCanvas";
import { Game } from "../components/game/interfaces/game.interfaces";
import Layout from "../components/Layout/Layout";
import classes from "./GamePage.module.css";

const GamePage = () => {
	const [game, setGame] = useState<Game>();
	const autoFocusRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate();

	useEffect(() => {
		if (autoFocusRef.current)
			autoFocusRef.current.focus()
		socket.emit('getMyGame');
		socket.on('updatedGame', (updatedGame) => {
			setGame(updatedGame)
		})
		socket.on('clientLeft', () => {
			socket.emit('leaveGame', game?.id)
			navigate("/");
		});
	}, [])

	const handleKeyDown = (event: any) => {
		if (game) {
			if (event.key === "w")
				socket.emit("movePad", {
					direction: "up",
					roomId: game.id,
					type: "online",
				});
			if (event.key === "s")
				socket.emit("movePad", {
					direction: "down",
					roomId: game.id,
					type: "online",
				});
			if (game.type === "local") {
				if (event.keyCode === 38)
					socket.emit("movePad", {
						direction: "up",
						roomId: game.id,
						type: "local",
					});
				if (event.keyCode === 40)
					socket.emit("movePad", {
						direction: "down",
						roomId: game.id,
						type: "local",
					});
			}
			if (game.state === "readyPlay" && event.key === "Enter")
				socket.emit('gameLoop', game.id);
		}
	};

	return (
		<Layout>
			<div
				tabIndex={0}
				className={classes.autoFocus}
				ref={autoFocusRef}
				onKeyDown={handleKeyDown}
			>
				{game && game.state != "end" ? (
					<React.Fragment>
						<GameCanvas className={classes.gameCanvas} game={game} />
						<div className={classes.badges}>
							<div className={classes.badge1}>
								<img
									src={
										game.player1.user?.profileImage
											? game.player1.user.profileImage
											: game.player1.user?.image_url
									}
									alt="Profile Player1"
									className={classes.profile}
								/>
								<div className={classes.username}>
									{game.player1.user.username}
								</div>
							</div>
							<div className={classes.badge2}>
								<img
									src={
										game.player2.user?.profileImage
											? game.player2.user.profileImage
											: game.player2.user?.image_url
									}
									alt="Profile player 2"
									className={classes.profile}
								/>
								<div className={classes.username}>
									{game.player2.user.username}
								</div>
							</div>
						</div>
					</React.Fragment>
				) : (
					<p>There is a winner</p>
				)}
			</div>
		</Layout>
	);
};

export default GamePage;
