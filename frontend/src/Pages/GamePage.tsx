import { useEffect, useState } from "react";
import { socket } from "../App";
import GameCanvas from "../components/game/GameCanvas";
import { Game } from "../components/game/interfaces/game.interfaces";

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
		<div onKeyDown={handleKeyDown}>
			{game ? <GameCanvas grid={game.grid} /> : null}
		</div>
	)
}

export default GamePage;