import { useState } from "react";
import { socket } from "../App";
import GameScreen from "../components/game/GameScreen";
import classes from "../components/game/GameScreen.module.css";
import Layout from "../components/Layout/Layout";

const GamePage = () => {
  const [localGame, setLocalGame] = useState<boolean>(false);
  const [matchMaking, setMatchMaking] = useState<boolean>(false);

  const toggleLocalGame = () => {
    setLocalGame(true);
    socket.emit("toggleLocalGame");
  };

  const toggleMatchMaking = () => {
    setMatchMaking(true);
    socket.emit("toggleMatchMaking");
  };

  return (
    <Layout>
      {localGame || matchMaking ? (
        <GameScreen />
      ) : (
        <div className={classes.preGame}>
          <button onClick={toggleLocalGame}>Local Game</button>
          <button onClick={toggleMatchMaking}>Match Making</button>
        </div>
      )}
    </Layout>
  );
};

export default GamePage;
