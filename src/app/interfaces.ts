export interface Game {
  cost: number;
  time: number;
  involved: { playerID: string; winner: Boolean }[];
}

export interface Player {
  name: String;
  id: string;
}
