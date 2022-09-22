import { Ball, Coordinate, Pad } from "../interfaces/game.interface"

enum GRID {
  HEIGHT = 100,
  WIDTH = 175,
  BALL_RADIUS = 10,
  PAD_WIDTH = 20,
  PAD_HEIGHT = 40,
}

export const initPad = (xStart: number, yStart: number) => {
  return {
    pos: {
      x: xStart,
      y: yStart
    },
    size: {
      x: GRID.PAD_WIDTH,
      y: GRID.PAD_HEIGHT,
    }
  }
}

export const initGrid = () => {
  let size: Coordinate = { x: GRID.WIDTH, y: GRID.HEIGHT }
  let ball: Ball = {
    pos: {
      x: size.x / 2,
      y: size.y / 2,
    },
    radius: GRID.BALL_RADIUS
  }
  let pad1: Pad = initPad(0, size.y / 2 - GRID.PAD_HEIGHT / 2);
  let pad2: Pad = initPad(GRID.WIDTH - GRID.PAD_WIDTH, size.y / 2 - GRID.PAD_HEIGHT / 2);
  let grid = { ball, pad1, pad2, size }
  return grid;
}