// Shared protocol types. The client mirrors these in src/lib/roomTypes.ts.

export interface Player {
  id: string
  name: string
  joinedAt: number
}

export interface RoundData {
  impostorId: string
  word: string
  actualCategory: string
  startingPlayerId: string
  assignedIds: string[]
}

export interface RoomState {
  code: string
  hostId: string
  phase: 'lobby' | 'playing'
  round: number
  category: string
  players: Player[]
  current: RoundData | null
  createdAt: number
  updatedAt: number
}

// ---- What a single client is allowed to see ----

export type PersonalRole =
  | null
  | { status: 'pending' }
  | { status: 'impostor'; hint: string }
  | { status: 'crew'; word: string }

export interface PublicPlayer {
  id: string
  name: string
  connected: boolean
  isHost: boolean
}

export interface PersonalState {
  code: string
  phase: 'lobby' | 'playing'
  round: number
  category: string
  actualCategory: string | null
  minPlayers: number
  hostId: string
  you: { id: string; name: string; isHost: boolean } | null
  players: PublicPlayer[]
  startingPlayerName: string | null
  role: PersonalRole
}
