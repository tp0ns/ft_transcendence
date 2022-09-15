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
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvas.current!.getContext("2d");
    // socket.emit("joinMatch");
    socket.on("setPosition", (leftPos, rightPos, ballPos, p1Score, p2Score) => {
      leftPadPosition = leftPos;
      rightPadPosition = rightPos;
      player1Score = p1Score;
      player2Score = p2Score;
      context!.clearRect(0, 0, canvas.current!.width, canvas.current!.height);

      //  draw the ball
      ballPosition = ballPos;
      context!.arc(5, 5, 5, 0, 2 * Math.PI);
      context!.beginPath();
      context!.arc(
        ballPosition.x,
        ballPosition.y,
        ballPosition.radius,
        ballPosition.startAngle,
        2 * Math.PI
      );
      context!.lineWidth = 1;
      context!.fillStyle = "#3a3636";
      context!.fill();

      //draw left pad
      context!.fillStyle = "#3a3636";
      context!.fillRect(
        leftPadPosition.x,
        leftPadPosition.y - leftPadPosition.h, // in order to be at the middle of the pad
        leftPadPosition.w,
        leftPadPosition.h
      );

      //draw right pad
      context!.fillRect(
        rightPadPosition.x,
        rightPadPosition.y - rightPadPosition.h,
        rightPadPosition.w,
        rightPadPosition.h
      );

      //draw the score:
      context!.font = "80px blippoblack";
      context!.fillStyle = "#3a36367c";
      context!.fillText(player1Score.toString(), 150, 100);
      context!.fillText(player2Score.toString(), 490, 100);
    });

    // do something here with the canvas
  }, []);

  const handleLocalGame = () => {
    props.handleGame("inGame");
    socket.emit("toggleLocalGame");
  }

  const handleMatchMaking = () => {
    props.handleGame("inGame");
    socket.emit("toggleMatchMaking");
    socket.emit("joinMatch");
  }

  return (
    <div>
      <canvas
        tabIndex={0}
        width="640"
        height="480"
        ref={canvas}
        className={classes.canvas}
      />
      <div className={classes.preGame}>
        <button onClick={handleLocalGame}>Local Game</button>
        <button onClick={handleMatchMaking}>Match Making</button>
      </div>
    </div>
  );
};

export default HomeScreen;