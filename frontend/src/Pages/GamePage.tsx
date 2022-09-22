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

	const handleKeyDown = () => {

	}

	return (
		<div className={classes.window} onKeyDown={handleKeyDown}>
			{game ? <GameCanvas className={classes.gameCanvas} game={game} /> : null}
		</div>
	)
}

export default GamePage;