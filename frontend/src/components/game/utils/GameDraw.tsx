import { createTextSpanFromBounds } from "typescript"
import { Grid } from "../../../../../backend/src/game/interfaces/game.interface";


// export const drawBackground = (
//   context: CanvasRenderingContext2D,
//   grid: Grid
// ) {

// }

export const drawPads = (
  context: CanvasRenderingContext2D,
  grid: Grid
) => {
  grid.pads.forEach((pad: any) => {
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