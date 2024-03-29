import UserProp from "../../../interfaces/User.interface";

export type Game_Type = "local" | "online"

export interface Coordinate {
  x: number;
  y: number;
}

export interface Pad {
  pos: Coordinate;
  size: Coordinate;
}

export interface Ball {
  pos: Coordinate;
  radius: number;
  direction: Coordinate;
}

export interface Grid {
  ball: Ball;
  pad1: Pad;
  pad2: Pad;
  size: Coordinate;
}

export interface Player {
  user: UserProp;
  score: number;
}

export interface Game {
  id: string;
  grid: Grid;
  player1: Player;
  player2: Player;
  spectatorIds: string[];
  state: string;
  type: Game_Type;
}