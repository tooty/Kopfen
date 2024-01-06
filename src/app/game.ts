
export interface Game {
  cost: number
  time: number
  players: ActivePlayer[]
}

export interface ActivePlayer{
  id: number
  cost: number
}
