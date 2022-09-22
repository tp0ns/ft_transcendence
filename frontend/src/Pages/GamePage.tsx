import { useEffect, useState } from "react";
import { socket } from "../App";
import GameCanvas from "../components/game/GameCanvas";
import { Game } from "../../../backend/src/game/interfaces/game.interface"

const GamePage = () => {
	const [game, setGame] = useState<Game>();

	useEffect(() => {
		socket.emit('initGame');
		socket.on('updatedGame', (newGame: Game) => {
			setGame(newGame);
		})
	}, [])

	const handleKeyDown = () => {

	}

	return (
		<div onKeyDown={handleKeyDown}>
			{game ? <GameCanvas canvas={game.canvas} /> : null}
		</div>
	)
}

export default GamePage;