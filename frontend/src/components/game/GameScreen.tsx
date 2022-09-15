// import classes from "./GameScreen.module.css";
// import { socket } from "../../App";
// import { useEffect, useRef, useState } from "react";

// let ballPosition = {
// 	x: 0,
// 	y: 0,
// 	radius: 10,
// 	startAngle: 0,
// 	speedx: 5,
// 	speedy: 0,
// 	goRight: 0,
// 	p1Touches: 0,
// 	p2Touches: 0,
// 	isMoving: false,
// };
// let leftPadPosition = {
// 	x: 0,
// 	y: 50,
// 	w: 20,
// 	h: 100,
// 	speed: 5,
// };

// let rightPadPosition = {
// 	x: 620,
// 	y: 200,
// 	w: 20,
// 	h: 100,
// 	speed: 20,
// };

// let player1Score: number = 0;
// let player2Score: number = 0;

// const GameScreen: React.FC<{
// 	gameType: string
// }> = (props) => {
// 	const canvas = useRef<HTMLCanvasElement>(null);
// 	const [lockEnter, setLockEnter] = useState<boolean>(false);

// 	// useEffect(() => {
// 	// 	console.log("props.gameType", props.gameType)
// 	// 	if (props.gameType === "localGame")
// 	// 		handleLocalGame();
// 	// 	else if (props.gameType === "matchGame")
// 	// 		handleMatchMaking();
// 	// }, [props.gameType])

// 	useEffect(() => {
// 		const context = canvas.current!.getContext("2d");
// 		// socket.emit("joinMatch");
// 		socket.on("setPosition", (leftPos, rightPos, ballPos, p1Score, p2Score) => {
// 			leftPadPosition = leftPos;
// 			rightPadPosition = rightPos;
// 			player1Score = p1Score;
// 			player2Score = p2Score;
// 			context!.clearRect(0, 0, canvas.current!.width, canvas.current!.height);

// 			//  draw the ball
// 			ballPosition = ballPos;
// 			context!.arc(5, 5, 5, 0, 2 * Math.PI);
// 			context!.beginPath();
// 			context!.arc(
// 				ballPosition.x,
// 				ballPosition.y,
// 				ballPosition.radius,
// 				ballPosition.startAngle,
// 				2 * Math.PI
// 			);
// 			context!.lineWidth = 1;
// 			context!.fillStyle = "#3a3636";
// 			context!.fill();

// 			//draw left pad
// 			context!.fillStyle = "#3a3636";
// 			context!.fillRect(
// 				leftPadPosition.x,
// 				leftPadPosition.y - leftPadPosition.h, // in order to be at the middle of the pad
// 				leftPadPosition.w,
// 				leftPadPosition.h
// 			);

// 			//draw right pad
// 			context!.fillRect(
// 				rightPadPosition.x,
// 				rightPadPosition.y - rightPadPosition.h,
// 				rightPadPosition.w,
// 				rightPadPosition.h
// 			);

// 			//draw the score:
// 			context!.font = "80px blippoblack";
// 			context!.fillStyle = "#3a36367c";
// 			context!.fillText(player1Score.toString(), 150, 100);
// 			context!.fillText(player2Score.toString(), 490, 100);
// 		});
// 		console.log("pos handle");
// 		if (props.gameType === "localGame")
// 			handleLocalGame();
// 		else if (props.gameType === "matchGame")
// 			handleMatchMaking();
// 		// do something here with the canvas
// 	}, []);

// 	const move = (direction: string) => {
// 		socket.emit("move", direction);
// 	};

// 	const gameFunctions = (func: string, score: number) => {
// 		socket.emit("gameFunctions", func, score);
// 	};

// 	const mouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
// 		socket.emit("mouseMove", event.clientY);
// 	};

// 	const moveBall = () => {
// 		// var p1: number = 0;
// 		ballPosition.isMoving = true;
// 		if (ballPosition.goRight === 0) {
// 			if (
// 				ballPosition.y + ballPosition.speedy <= 10 ||
// 				ballPosition.y + ballPosition.speedy >= 470
// 			) {
// 				ballPosition.speedy = -ballPosition.speedy;
// 			}
// 			if (ballPosition.x + ballPosition.speedx >= 630) {
// 				// collision with left wall. 630 = point of contact in px
// 				ballPosition.x = 630;
// 				//end of the round - need to add score management
// 				// collision with left wall -> point to right
// 				// p1 += 1;
// 				gameFunctions("resetBall", 2);
// 				return;
// 			} else {
// 				ballPosition.x += ballPosition.speedx;
// 				ballPosition.y += ballPosition.speedy;
// 			}
// 			// collisions with the right pad
// 			if (
// 				rightPadPosition.y - rightPadPosition.h <= ballPosition.y &&
// 				ballPosition.y <= rightPadPosition.y &&
// 				ballPosition.x >= rightPadPosition.x - rightPadPosition.w
// 			) {
// 				var impact = ballPosition.y - rightPadPosition.y + rightPadPosition.h / 2;
// 				var ratio = 100 / (rightPadPosition.h / 2);
// 				var angle = Math.round((impact * ratio) / 10);
// 				if (angle >= 10) {
// 					angle -= 10;
// 					angle = -angle;
// 				}
// 				ballPosition.speedy = angle;
// 				ballPosition.goRight = 1;
// 				ballPosition.p2Touches++;
// 			}
// 		} else {
// 			if (
// 				ballPosition.y + ballPosition.speedy <= 0 ||
// 				ballPosition.y + ballPosition.speedy >= 470
// 			) {
// 				ballPosition.speedy = -ballPosition.speedy;
// 			}
// 			if (ballPosition.x - ballPosition.speedx <= 10) {
// 				// collision with left wall. 10 = point of contact in px
// 				ballPosition.x = 10;
// 				//end of the round
// 				gameFunctions("resetBall", 1);
// 				return;
// 			} else {
// 				ballPosition.x -= ballPosition.speedx;
// 				ballPosition.y += ballPosition.speedy;
// 			}
// 			// collisions with the left pad
// 			if (
// 				leftPadPosition.y - leftPadPosition.h <= ballPosition.y &&
// 				ballPosition.y <= leftPadPosition.y &&
// 				ballPosition.x <= leftPadPosition.x + leftPadPosition.w
// 			) {
// 				impact = ballPosition.y - leftPadPosition.y + leftPadPosition.h / 2;
// 				ratio = 100 / (leftPadPosition.h / 2);
// 				angle = Math.round((impact * ratio) / 10);
// 				if (angle >= 10) {
// 					angle -= 10;
// 					angle = -angle;
// 				}
// 				ballPosition.speedy = angle;
// 				ballPosition.goRight = 0;
// 				ballPosition.p1Touches++;
// 			}
// 		}
// 		if (ballPosition.x !== 10 && ballPosition.x !== 630) {
// 			// animation until the ball touches the wall
// 			requestAnimationFrame(moveBall);
// 		}
// 		console.log("ballPosition: ", ballPosition);
// 		socket.emit("ballMovement", ballPosition)//, p1)//, player2Score);
// 	};

// 	useEffect(() => {
// 		console.log("Lock enter in useEffect; ", lockEnter);
// 		if (lockEnter) moveBall();
// 	}, [lockEnter]);

// 	const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
// 		if (event.key === "Enter") {
// 			if (ballPosition.isMoving === true || player1Score === 5 || player2Score === 5) {
// 				return;
// 			}
// 			moveBall();
// 		}
// 		if (event.key === "w") {
// 			move("up");
// 		}

// 		if (event.key === "s") {

// 			move("down");
// 		}
// 	};

// 	const handleStart = () => {
// 		moveBall();
// 	};

// 	const handleReset = () => {
// 		gameFunctions("resetBall", 0);
// 	};

// 	const handleLocalGame = () => {
// 		socket.emit("toggleLocalGame");
// 	}

// 	const handleMatchMaking = () => {
// 		socket.emit("toggleMatchMaking");
// 		socket.emit("joinMatch");
// 	}

// 	return (
// 		<div>
// 			<div>
// 				<div className={classes.profile1}>
// 					<img src={classes.img} />
// 				</div>
// 				<canvas
// 					tabIndex={0}
// 					onMouseMove={mouseMove}
// 					onKeyDown={handleKeyDown}
// 					width="640"
// 					height="480"
// 					ref={canvas}
// 					className={classes.canvas}
// 				/>
// 				<p>
// 					{/* <button onClick={handleStart}>Start</button>
// 					<button onClick={handleReset}>Reset Ball</button> */}
// 				</p>
// 			</div>
// 		</div>
// 	);
// };

// export default GameScreen;

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

let player1Score: number = 0;
let player2Score: number = 0;

const GameScreen: React.FC<{
	gameType: string
}> = (props) => {
	const canvas = useRef<HTMLCanvasElement>(null);
	const [lockEnter, setLockEnter] = useState<boolean>(false);

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
		if (props.gameType === "localGame")
			toggleLocalGame();
		else if (props.gameType === "matchGame")
			toggleMatchMaking();
		// do something here with the canvas
	}, []);

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
		socket.emit("mouseMove", event.clientY);
	};

	const toggleLocalGame = () => {
		console.log("yala1")
		socket.emit("toggleLocalGame");
		console.log("yala2")
	};

	const toggleMatchMaking = () => {
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
		console.log("Lock enter in useEffect; ", lockEnter);
		if (lockEnter) moveBall();
	}, [lockEnter]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
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

	const handleStart = () => {
		moveBall();
	};

	const handleReset = () => {
		gameFunctions("resetBall", 0);
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
		</div>
	);
};

export default GameScreen;
