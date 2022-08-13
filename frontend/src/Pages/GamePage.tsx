import { useState } from "react";
import { socket } from "../App";
import GameScreen from "../components/game/GameScreen";
import NavBar from "../components/NavBar/NavBar";
import classes from "../components/game/GameScreen.module.css";

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
    <div>
      <NavBar />
      {localGame || matchMaking ? (
        <GameScreen />
      ) : (
        <div className={classes.preGame}>
          <button onClick={toggleLocalGame}>Local Game</button>
          <button onClick={toggleMatchMaking}>Match Making</button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
