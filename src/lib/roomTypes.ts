// Client mirror of worker/types.ts — the shapes the server sends us.

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

export interface SoloReveal {
  actualCategory: string
  startingPlayer: number
  players: number
  round: number
  seat: number
  role: Exclude<PersonalRole, null | { status: 'pending' }>
}

export type ConnStatus = 'connecting' | 'live' | 'reconnecting' | 'offline'
