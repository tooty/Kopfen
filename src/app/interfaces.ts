
export interface Game {
  cost: number
  time: number
  involved: {playerID: number, winner: Boolean}[]
}

export interface Player {
  name: String,
  id: number
}
