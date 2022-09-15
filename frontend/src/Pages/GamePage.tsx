import React, { useState } from "react";
import GameScreen from "../components/game/GameScreen";
import HomeScreen from "../components/game/HomeScreen";
import Layout from "../components/Layout/Layout";

const GamePage = () => {
	const [gameState, setGameState] = useState<string>("noGame");

	const handleGameType = (state: string) => {
		setGameState(state);

	}


	return (
		<Layout>
			<div>
				{gameState === "noGame" ? <HomeScreen handleGame={handleGameType} /> : null}
				{gameState === ("localGame" || "matchGame") ? <GameScreen gameType={gameState} /> : null}
				{/* {gameState === "endGame" ? <EndScreen /> : null} */}
			</div>
		</Layout>
	);
};

export default GamePage;
