import React, { useState } from "react";
import GameScreen from "../components/game/GameScreen";
import HomeScreen from "../components/game/HomeScreen";
import Layout from "../components/Layout/Layout";

const GamePage = () => {
	const [gameState, setGameState] = useState<string>("noGame");

	const handleGame = (state: string) => {
		setGameState(state);
	}


	return (
		<Layout>
			<React.Fragment>
				{gameState === "noGame" ? <HomeScreen handleGame={handleGame} /> : null}
				{gameState === "inGame" ? <GameScreen /> : null}
				{/* {gameState === "endGame" ? <EndScreen /> : null} */}
			</React.Fragment>
		</Layout>
	);
};

export default GamePage;
