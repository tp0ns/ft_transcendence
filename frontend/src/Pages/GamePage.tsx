import React, { useState } from "react";
import { socket } from "../App";
import EndScreen from "../components/game/EndScreen";
import GameScreen from "../components/game/GameScreen";
import HomeScreen from "../components/game/HomeScreen";
import Layout from "../components/Layout/Layout";

const GamePage = () => {
	const [gameState, setGameState] = useState<string>("noGame");
	const [winner, setWinner] = useState<string>("");

	const handleGameType = (state: string) => {
		setGameState(state);
	}

	socket.on('victoryOf', (winnerSock) => {
		console.log("entered Victory of: ", winnerSock)
		if (gameState === "matchGame")
			setWinner(winnerSock.username);
		else if (gameState === "localGame")
			setWinner("");
		setGameState("endGame");
	});


	return (
		<Layout>
			<div>
				{gameState === "noGame" ? <HomeScreen handleGame={handleGameType} /> : null}
				{gameState === ("localGame" || "matchGame") ? <GameScreen gameType={gameState} /> : null}
				{gameState === "endGame" ? <EndScreen winner={winner} handleGame={handleGameType} /> : null}
			</div>
		</Layout>
	);
};

export default GamePage;
