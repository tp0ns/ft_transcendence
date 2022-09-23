import { useEffect, useState } from "react";
import { socket } from "../App";
import GameCanvas from "../components/game/GameCanvas";
import { Game } from "../components/game/interfaces/game.interfaces";
import classes from "./GamePage.module.css"

const GamePage = () => {
	const [game, setGame] = useState<Game>();

	useEffect(() => {
		socket.emit('joinDummyGame', 1);
		socket.on('newGame', (newGame: any) => {
			socket.emit('createGame');
		})
		socket.on('updatedGame', (updatedGame) => (setGame(updatedGame)))
	}, [])

	useEffect(() => {
		console.log(game);
	}, [game])

	const handleKeyDown = (event: any) => {
		console.log("entered key down")
		if (game) {
			if (event.key === "w")
				socket.emit("movePad", "up", game.id);
			if (event.key === "s")
				socket.emit("movePad", "down", game.id);
		}
	}

	document.addEventListener('keydown', handleKeyDown);
	document.removeEventListener('keydown', handleKeyDown);

	return (
		<div className={classes.window} onKeyDown={handleKeyDown}>
			{game ? <GameCanvas className={classes.gameCanvas} game={game} /> : null}
		</div>
	)
}

export default GamePage;