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

export enum Screen {
  //component templates use order indexes
  player, //0
  table, //1
  game, //2
  graph, //3
  vision, //4
}
