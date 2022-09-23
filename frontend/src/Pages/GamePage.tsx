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
	const autoFocusRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (autoFocusRef.current)
			autoFocusRef.current.focus()
		socket.emit('joinDummyGame', "1");
		socket.on('newGame', (newGame: any) => {
			socket.emit('createGame');
		})
		socket.on('updatedGame', (updatedGame) => (setGame(updatedGame)))
	}, [])

	// useEffect(() => {
	// 	window.addEventListener('keydown', handleKeyDown, { once: true });
	// 	document.removeEventListener('keydown', handleKeyDown);
	// }, [game])

	const handleKeyDown = (event: any) => {
		console.log("entered key down")
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
		<Layout>
			<div tabIndex={0} className={classes.autoFocus} ref={autoFocusRef} onKeyDown={handleKeyDown}>
				{game ? <GameCanvas className={classes.gameCanvas} game={game} /> : null}
			</div>
		</Layout>
	)
}

export default GamePage;