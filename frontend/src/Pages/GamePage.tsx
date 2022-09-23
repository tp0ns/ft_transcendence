import { useEffect, useState } from "react";
import { socket } from "../App";
import GameCanvas from "../components/game/GameCanvas";
import { Game } from "../components/game/interfaces/game.interfaces";
import classes from "./GamePage.module.css"

const GamePage = () => {
	const [game, setGame] = useState<Game>();

	useEffect(() => {
		socket.emit('joinDummyGame', "1");
		socket.on('newGame', (newGame: any) => {
			socket.emit('createGame');
		})
		socket.on('updatedGame', (updatedGame) => (setGame(updatedGame)))
	}, [])

	useEffect(() => {
		console.log(game);
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			socket.off('newGame', (newGame: any) => {
				socket.emit('createGame');
			})
			socket.off('updatedGame', (updatedGame) => (setGame(updatedGame)))
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [game])

	const handleKeyDown = (event: any) => {
		// console.log("entered key down")
		// console.log("game in handleKeyDown", game)
		if (game) {
			console.log("entered if")
			if (event.key === "w") {
				console.log("game in handleKeyDown if", game.id)
				socket.emit("movePad", { direction: "up", roomId: game.id });
			}
			if (event.key === "s")
				socket.emit("movePad", { direction: "down", roomId: game.id });
		}
	}



	return (
		<div className={classes.window} onKeyDown={handleKeyDown}>
			{game ? <GameCanvas className={classes.gameCanvas} game={game} /> : null}
		</div>
	)
}

export default GamePage;