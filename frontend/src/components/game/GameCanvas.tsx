import { useEffect, useRef } from "react";
import { drawBall, drawPads, drawScore } from "./utils/GameDraw";
import "./GameCanvas.css"
import { Game, Grid } from "./interfaces/game.interfaces";

const GameCanvas: React.FC<{
	game: Game,
	className: any
}> = (props) => {
	const { id, grid, player1, player2 } = props.game;
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const drawCanvas = (context: any, grid: any) => {
		context.clearRect(0, 0, grid.size.x, grid.size.y);
		context.beginPath();
		drawPads(context, grid);
		drawBall(context, grid);
		drawScore(context, player1.score, player2.score, grid.size);
	}

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext('2d');
		drawCanvas(context, grid);
	}, [grid])

	return (
		<canvas
			id='gameCanvas'
			ref={canvasRef}
			width={grid.size.x}
			height={grid.size.y}
		/>
	)
}

export default GameCanvas;