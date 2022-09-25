import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { socket } from "../App";
import GameCanvas from "../components/game/GameCanvas";
import { Game } from "../components/game/interfaces/game.interfaces";
import Layout from "../components/Layout/Layout";
import classes from "./GamePage.module.css"

const GamePage = () => {
	const [game, setGame] = useState<Game>();
	const autoFocusRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (autoFocusRef.current)
			autoFocusRef.current.focus()
		socket.emit('getMyGame');
		socket.on('updatedGame', (updatedGame) => {
			setGame(updatedGame)
		})
	}, [])

	const handleKeyDown = (event: any) => {
		if (game) {
			if (event.key === "w")
				socket.emit("movePad", { direction: "up", roomId: game.id, type: "online" });
			if (event.key === "s")
				socket.emit("movePad", { direction: "down", roomId: game.id, type: "online" });
			if (game.type === 'local') {
				if (event.keyCode === 38)
					socket.emit("movePad", { direction: "up", roomId: game.id, type: "local" });
				if (event.keyCode === 40)
					socket.emit("movePad", { direction: "down", roomId: game.id, type: "local" });
			}
			if (game.state === "readyPlay" && event.key === "Enter")
				socket.emit('gameLoop', game.id);
		}
	}

	return (
		<Layout>
			<div tabIndex={0} className={classes.autoFocus} ref={autoFocusRef} onKeyDown={handleKeyDown}>
				{game && game.state != "end" ? <GameCanvas className={classes.gameCanvas} game={game} /> : <p>There is a winner</p>}
			</div>
		</Layout>
	)
}

export default GamePage;