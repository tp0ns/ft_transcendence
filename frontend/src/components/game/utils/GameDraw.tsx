import { createTextSpanFromBounds } from "typescript"
import { Coordinate, Grid, Pad } from "../interfaces/game.interfaces";


// export const drawBackground = (
//   context: CanvasRenderingContext2D,
//   grid: Grid
// ) {

// }

export const drawPads = (
  context: CanvasRenderingContext2D,
  grid: Grid
) => {
  const pads: Pad[] = [grid.pad1, grid.pad2]
  pads.forEach((pad: any) => {
    context.fillStyle = 'black';
    context.fillRect(
      pad.pos.x,
      pad.pos.y,
      pad.size.x,
      pad.size.y
    );
  })
}

export const drawBall = (
  context: CanvasRenderingContext2D,
  grid: Grid
) => {
  context.fillStyle = 'black';
  context.arc(
    grid.ball.pos.x,
    grid.ball.pos.y,
    grid.ball.radius,
    0,
    2 * Math.PI,
  )
  context.fill();
}

export const drawScore = (
  context: CanvasRenderingContext2D,
  score1: number,
  score2: number,
  gridSize: Coordinate
) => {
  context.font = "80px blippoblack";
  context!.fillStyle = "#3a36367c";
  context!.fillText(score1.toString(), Math.round(gridSize.x / 2 - 65), Math.round(gridSize.y * 0.2));
  context!.fillText(score2.toString(), Math.round(gridSize.x / 2 + 20), Math.round(gridSize.y * 0.2));
}