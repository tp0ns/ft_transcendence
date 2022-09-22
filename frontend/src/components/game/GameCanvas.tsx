import { useEffect, useRef } from "react";
import { drawBall, drawPads } from "./utils/GameDraw";

const GameCanvas: React.FC<{ grid: any }> = (props) => {
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
	})

	return (
		<canvas
			id='gameCanvas'
			ref={canvasRef}
			width={grid.width}
			height={grid.height}
		/>
	)
}

export default GameCanvas;