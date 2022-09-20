import classes from "./GameScreen.module.css";
import { socket } from "../../App";
import { useEffect, useRef, useState } from "react";

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

const baseWidth: number = 640;
const baseHeight: number = 480;

let player1Score: number = 0;
let player2Score: number = 0;

const GameScreen: React.FC<{
	gameType: string
}> = (props) => {
	const canvas = useRef<HTMLCanvasElement>(null);
	const [lockEnter, setLockEnter] = useState<boolean>(false);
	const [waiting, setWaiting] = useState<boolean>(false);
	const [windowSizeState, setWindowSize] = useState(getWindowSize());


	// function to define position and sizes to actual window
	const translateToCanvas = (leftPadPosition: any, rightPadPosition: any, ballPosition: any, windowSize: any) => {
		// console.log("window size in translate: ", windowSize)
		// console.log("- TRANSLATE TO CANVAS -\nwindowSize.innerWidth: ", windowSize.innerWidth, "windowSize.innerHeight: ", windowSize.innerHeight)
		leftPadPosition.x = 0;
		leftPadPosition.y = Math.round(leftPadPosition.y * windowSize.innerHeight / baseHeight);
		// leftPadPosition.w = (20 / 640) * windowSize.innerWidth;
		// leftPadPosition.h = (100 / 480) * windowSize.innerHeight;

		rightPadPosition.x = Math.round(windowSize.innerWidth - 20);
		rightPadPosition.y = Math.round(rightPadPosition.y * windowSize.innerHeight / baseHeight);
		// rightPadPosition.w = (20 / 640) * windowSize.innerWidth;
		// rightPadPosition.h = (100 / 480) * windowSize.innerHeight;

		ballPosition.x = Math.round(ballPosition.x * windowSize.innerWidth / baseWidth);
		ballPosition.y = Math.round(ballPosition.y * windowSize.innerHeight / baseHeight);
		// ballPosition.radius = (10 / 480) * windowSize.innerHeight;
	}

	useEffect(() => {

		const context = canvas.current!.getContext("2d");
		// socket.emit("joinMatch");
		socket.on("setPosition", (leftPos, rightPos, ballPos, p1Score, p2Score, windowSizeArg) => {
			context!.clearRect(0, 0, canvas.current!.width, canvas.current!.height);
			let windowSize = windowSizeState;
			console.log("windowSize arg: ", windowSizeArg)
			// if (windowSizeArg)
			// 	windowSize = windowSizeArg
			leftPadPosition = leftPos;
			rightPadPosition = rightPos;
			ballPosition = ballPos;
			player1Score = p1Score;
			player2Score = p2Score;
			// Adapt size to window at new position sent from backend
			translateToCanvas(leftPadPosition, rightPadPosition, ballPosition, windowSize);
			console.log("- After socket.on() -\n\n")
			console.log("canvas size: ", windowSize);
			console.log("leftPadPosition: ", leftPadPosition);
			console.log("rightPadPosition: ", rightPadPosition);
			console.log("-------------------------\n\n")


			//  draw the ball
			// context!.arc(5, 5, 5, 0, 2 * Math.PI);
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
			console.log()
			context!.fillText(player1Score.toString(), Math.round(windowSize.innerWidth / 2 - 65), Math.round(windowSize.innerHeight * 0.2));
			context!.fillText(player2Score.toString(), Math.round(windowSize.innerWidth / 2 + 20), Math.round(windowSize.innerHeight * 0.2));
		});

		// do something here with the canvas
		if (props.gameType === "localGame")
			toggleLocalGame();
		else if (props.gameType === "matchGame") {
			toggleMatchMaking();
		}
		// do something here with the canvas

		function handleWindowResize() {
			setWindowSize(getWindowSize());
		}

		window.addEventListener('resize', handleWindowResize);
		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, [windowSizeState]);

	// useEffect(() => () => {
	// 	console.log("- Before redraw -\n\n")
	// 	console.log("canvas size: ", windowSizeState);
	// 	console.log("leftPadPosition: ", leftPadPosition);
	// 	console.log("rightPadPosition: ", rightPadPosition);
	// 	console.log("-------------------------\n\n")
	// 	socket.emit('redrawCanvas', windowSizeState);
	// }, [windowSizeState])

	function getWindowSize() {
		let { innerWidth, innerHeight } = window;
		innerWidth = Math.round(innerWidth * 0.7);
		innerHeight = Math.round(innerHeight * 0.6);
		return { innerWidth, innerHeight };
	}

	socket.on("gameStarted", () => {
		console.log("entered game started")
		setWaiting(false)
	})

	socket.on('inviteRefused', (userId: string) => {
		socket.emit('inviteIsDeclined', userId);
	});

	const move = (direction: string) => {
		socket.emit("move", direction);
	};

	const gameFunctions = (func: string, score: number) => {
		socket.emit("gameFunctions", func, score);
	};

	const mouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
		event.preventDefault();
		console.log("windowSizeState mouse move: ", windowSizeState)
		socket.emit("mouseMove", event.clientY);
	};

	const toggleLocalGame = () => {
		socket.emit("toggleLocalGame");
	};

	const toggleMatchMaking = () => {
		if (!waiting)
			setWaiting(true);
		socket.emit("toggleMatchMaking");
		socket.emit("joinMatch");

	};

	const moveBall = () => {
		// var p1: number = 0;
		ballPosition.isMoving = true;
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
				// collision with left wall -> point to right
				// p1 += 1;
				gameFunctions("resetBall", 2);
				return;
			} else {
				ballPosition.x += ballPosition.speedx;
				ballPosition.y += ballPosition.speedy;
			}
			// collisions with the right pad
			if (
				rightPadPosition.y - rightPadPosition.h <= ballPosition.y &&
				ballPosition.y <= rightPadPosition.y &&
				ballPosition.x >= rightPadPosition.x - rightPadPosition.w
			) {
				var impact = ballPosition.y - rightPadPosition.y + rightPadPosition.h / 2;
				var ratio = 100 / (rightPadPosition.h / 2);
				var angle = Math.round((impact * ratio) / 10);
				if (angle >= 10) {
					angle -= 10;
					angle = -angle;
				}
				ballPosition.speedy = angle;
				ballPosition.goRight = 1;
				ballPosition.p2Touches++;
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
				//end of the round
				gameFunctions("resetBall", 1);
				return;
			} else {
				ballPosition.x -= ballPosition.speedx;
				ballPosition.y += ballPosition.speedy;
			}
			// collisions with the left pad
			if (
				leftPadPosition.y - leftPadPosition.h <= ballPosition.y &&
				ballPosition.y <= leftPadPosition.y &&
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
				ballPosition.p1Touches++;
			}
		}
		if (ballPosition.x !== 10 && ballPosition.x !== 630) {
			// animation until the ball touches the wall
			requestAnimationFrame(moveBall);
		}
		socket.emit("ballMovement", ballPosition)//, p1)//, player2Score);
	};

	useEffect(() => {
		if (lockEnter) moveBall();
	}, [lockEnter]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
		event.preventDefault();
		if (event.key === "Enter") {
			if (ballPosition.isMoving === true || player1Score === 5 || player2Score === 5) {
				return;
			}
			moveBall();
		}
		if (event.key === "w") {
			move("up");
		}

		if (event.key === "s") {

			move("down");
		}
	};

	return (
		<div>
			<div>
				<div className={classes.profile1}>
					<img src={classes.img} />
				</div>
				<canvas
					tabIndex={0}
					onMouseMove={mouseMove}
					onKeyDown={handleKeyDown}
					width={windowSizeState.innerWidth}
					height={windowSizeState.innerHeight}
					ref={canvas}
					className={classes.canvas}
				/>
			</div>
			{waiting ? <h1>Waiting for opponent...</h1> : null}
		</div>
	);
};

export default GameScreen;
