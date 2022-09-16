import classes from "./GameScreen.module.css";
import { socket } from "../../App";
import { useEffect, useRef } from "react";

let ballPosition = {
  x: 0,
  y: 0,
  radius: 10,
  startAngle: 0,
  speedx: 5,
  speedy: 0,
  goRight: 0,
  p1Touches: 0,
  p2Touches: 0,
  isMoving: false,
};
let leftPadPosition = {
  x: 0,
  y: 50,
  w: 20,
  h: 100,
  speed: 5,
};

let rightPadPosition = {
  x: 620,
  y: 200,
  w: 20,
  h: 100,
  speed: 20,
};

let player1Score: number = 0;
let player2Score: number = 0;

const HomeScreen: React.FC<{
  handleGame: (state: string) => void
}> = (props) => {

  const handleLocalGame = () => {
    props.handleGame("localGame");
  }

  const handleMatchMaking = () => {
    props.handleGame("matchGame");
  }

  return (
    <div className={classes.preGame}>
      <h1>Ready to play?</h1>
      <div className={classes.Buttons}>
        <button onClick={handleLocalGame}>Local Game</button>
        <button onClick={handleMatchMaking}>Match Making</button>
      </div>
    </div>
  );
};

export default HomeScreen;