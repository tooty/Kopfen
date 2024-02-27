export interface Game {
  cost: number;
  time: number;
  synced: boolean;
  involved: { playerID: string; winner: Boolean }[];
}

export interface Player {
  name: string;
  id: string;
  synced: boolean;
}

export interface putItem {
  content: Object,
  URL: string
}
