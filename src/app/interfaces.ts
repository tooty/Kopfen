export interface Game {
  cost: number;
  time: number;
  involved: { playerID: string; winner: Boolean }[];
}

export interface Player {
  name: String;
  id: string;
}

export interface putItem {
  content: Object,
  URL: string
}
