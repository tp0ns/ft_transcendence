import { useEffect, useState } from "react";
import { socket } from "../App";
import GameCanvas from "../components/game/GameCanvas";
import { Game } from "../../../backend/src/game/interfaces/game.interface"

const GamePage = () => {
	const [game, setGame] = useState<Game>();

	useEffect(() => {
		socket.emit('dummyGame', 1);
		socket.on('newGame', (newGame: any) => {
			socket.emit('createGame');
		})
		socket.on('updatedGame', (updatedGame) => (setGame(updatedGame)))
	}, [])

	const handleKeyDown = () => {

	}

	return (
		<div onKeyDown={handleKeyDown}>
			{game ? <GameCanvas canvas={game.grid} /> : null}
		</div>
	)
}

export default GamePage;