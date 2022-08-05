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

const GameScreen = () => {
	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const context = canvas.current!.getContext("2d");
		socket.emit("joinMatch");
		socket.on("setPosition", (leftPos, rightPos, ballPos) => {
			leftPadPosition = leftPos;
			rightPadPosition = rightPos;
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
				leftPadPosition.y - 50,
				leftPadPosition.w,
				leftPadPosition.h
			);
			//draw right pad
			context!.fillRect(
				rightPadPosition.x,
				rightPadPosition.y - 50,
				rightPadPosition.w,
				rightPadPosition.h
			);
		});

		// do something here with the canvas
	}, []);

	const move = (direction: string) => {
		socket.emit("move", direction);
	};

	const gameFunctions = (func: any) => {
		socket.emit("gameFunctions", func);
	};

	const mouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
		socket.emit("mouseMove", event.clientY, ballPosition);
	};

	const moveBall = () => {
		if (ballPosition.goRight === 0) {
			if (
				ballPosition.y + ballPosition.speedy <= 10 ||
				ballPosition.y + ballPosition.speedy >= 470
			) {
				ballPosition.speedy = -ballPosition.speedy;
			}
			if (ballPosition.x + ballPosition.speedx >= 630) {
				// collision with left wall. 630 = point of contact in px
				ballPosition.x = 630;
				//end of the round - need to add score management
				gameFunctions("resetBall");
				return;
			} else {
				ballPosition.x += ballPosition.speedx;
				ballPosition.y += ballPosition.speedy;
			}
			// collisions with the right pad
			if (
				rightPadPosition.y - rightPadPosition.h / 2 <= ballPosition.y &&
				ballPosition.y <= rightPadPosition.y + rightPadPosition.h / 2 &&
				ballPosition.x >= rightPadPosition.x - rightPadPosition.w
			) {
				var impact =
					ballPosition.y - rightPadPosition.y + rightPadPosition.h / 2;
				var ratio = 100 / (rightPadPosition.h / 2);
				var angle = Math.round((impact * ratio) / 10);
				if (angle >= 10) {
					angle -= 10;
					angle = -angle;
				}
				ballPosition.speedy = angle;
				ballPosition.goRight = 1;
			}
		} else {
			if (
				ballPosition.y + ballPosition.speedy <= 0 ||
				ballPosition.y + ballPosition.speedy >= 470
			) {
				ballPosition.speedy = -ballPosition.speedy;
			}
			if (ballPosition.x - ballPosition.speedx <= 10) {
				// collision with left wall. 10 = point of contact in px
				ballPosition.x = 10;
				//end of the round - need to add score management
				gameFunctions("resetBall");
				return;
			} else {
				ballPosition.x -= ballPosition.speedx;
				ballPosition.y += ballPosition.speedy;
			}
			// collisions with the left pad
			if (
				leftPadPosition.y - leftPadPosition.h / 2 <= ballPosition.y &&
				ballPosition.y <= leftPadPosition.y + leftPadPosition.h / 2 &&
				ballPosition.x <= leftPadPosition.x + leftPadPosition.w
			) {
				impact = ballPosition.y - leftPadPosition.y + leftPadPosition.h / 2;
				ratio = 100 / (leftPadPosition.h / 2);
				angle = Math.round((impact * ratio) / 10);
				if (angle >= 10) {
					angle -= 10;
					angle = -angle;
				}
				ballPosition.speedy = angle;
				ballPosition.goRight = 0;
			}
		}
		if (ballPosition.x !== 10 && ballPosition.x !== 630) {
			// animation until the ball touches the wall
			requestAnimationFrame(moveBall);
		}
		socket.emit("ballMovement", ballPosition);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
		if (event.key === "Enter") {
			moveBall();
		}
		if (event.key === "Space") {
			gameFunctions("resetBall");
		}
		if (event.key === "w") {
			move("up");
		}

		if (event.key === "s") {
			
			move("down");
		}
	};

	const handleStart = () => {
		moveBall();
	};

	const handleReset = () => {
		gameFunctions("resetBall");
	};

	return (
		<div>
			<canvas
				tabIndex={0}
				onMouseMove={mouseMove}
				onKeyDown={handleKeyDown}
				width="640"
				height="480"
				ref={canvas}
				className={classes.canvas}
			/>
			<p>
				<button onClick={handleStart}>Start</button>
				<button onClick={handleReset}>Reset Ball</button>
			</p>
		</div>
	);
};

export default GameScreen;