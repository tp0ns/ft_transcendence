import { BALL_SPEED } from "../game.service"
import { Ball, Coordinate, Grid, Pad } from "../interfaces/game.interface"

export enum GRID {
  HEIGHT = 500,
  WIDTH = 700,
  BALL_RADIUS = 10,
  PAD_WIDTH = 20,
  PAD_HEIGHT = 120,
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
    radius: GRID.BALL_RADIUS,
    direction: {
      x: BALL_SPEED,
      y: BALL_SPEED / 4,
    }
  }
  let pad1: Pad = initPad(0, size.y / 2 - GRID.PAD_HEIGHT / 2);
  let pad2: Pad = initPad(GRID.WIDTH - GRID.PAD_WIDTH, size.y / 2 - GRID.PAD_HEIGHT / 2);
  let grid = { ball, pad1, pad2, size }
  return grid;
}