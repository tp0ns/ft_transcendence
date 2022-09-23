import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { socket } from "../App";
import GameCanvas from "../components/game/GameCanvas";
import { Game } from "../components/game/interfaces/game.interfaces";
import Layout from "../components/Layout/Layout";
import classes from "./GamePage.module.css"

let pressLock = false;

const GamePage = () => {
	const [game, setGame] = useState<Game>();
	const [gameOn, setGameOn] = useState<boolean>(false);
	const autoFocusRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (autoFocusRef.current)
			autoFocusRef.current.focus()
		socket.emit('joinDummyGame', "1");
		socket.on('newGame', (newGame: any) => {
			socket.emit('createGame');
		})
		socket.on('updatedGame', (updatedGame) => {
			console.log('hello');
			setGame(updatedGame)
		})
	}, [])

	const handleKeyDown = (event: any) => {
		if (game) {
			if (event.key === "w")
				socket.emit("movePad", { direction: "up", roomId: game.id });
			if (event.key === "s")
				socket.emit("movePad", { direction: "down", roomId: game.id });
			if (!game.ongoing && event.key === "Enter") {
				console.log("entered enter")
				socket.emit('gameLoop', { roomId: game.id, state: "start" });
			}
		}
	}



	return (
		<Layout>
			<div tabIndex={0} className={classes.autoFocus} ref={autoFocusRef} onKeyDown={handleKeyDown}>
				{game ? <GameCanvas className={classes.gameCanvas} game={game} /> : null}
			</div>
		</Layout>
	)
}

export default GamePage;