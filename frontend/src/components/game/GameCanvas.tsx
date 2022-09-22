import { useEffect, useRef } from "react";
import { drawBall, drawPads } from "./utils/GameDraw";
import "./GameCanvas.css"
import { Grid } from "./interfaces/game.interfaces";

const GameCanvas: React.FC<{ grid: Grid }> = (props) => {
	const grid = props.grid;
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const drawCanvas = (context: any, grid: any) => {
		context.clearRect(0, 0, grid.width, grid.height);
		context.beginPath();
		drawPads(context, grid);
		drawBall(context, grid);
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