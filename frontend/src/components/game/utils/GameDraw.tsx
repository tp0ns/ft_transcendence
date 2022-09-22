import { createTextSpanFromBounds } from "typescript"
import { Grid, Pad } from "../interfaces/game.interfaces";


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
      pad.width,
      pad.height
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