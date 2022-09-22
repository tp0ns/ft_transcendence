import { useEffect, useRef } from "react";
import { drawBall, drawPads } from "./utils/GameDraw";

const GameCanvas: React.FC<{ canvas: any }> = (props) => {
	const canvas = props.canvas;
	const ref = useRef<HTMLCanvasElement>(null)

	const drawCanvas = (context: CanvasRenderingContext2D, grid: any) => {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.beginPath();
		drawPads(context, grid);
		drawBall(context, grid);
	}

	useEffect(() => {
		const canvasRef = ref.current;
		const context = canvas.getContext('2d');
		drawCanvas(context, canvas.grid);
	})

	return (
		<canvas
			id='gameCanvas'
			ref={canvas.reference}
			width={canvas.width}
			height={canvas.height}
		/>
	)
}

export default GameCanvas;