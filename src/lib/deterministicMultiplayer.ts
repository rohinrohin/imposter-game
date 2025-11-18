import { seededRandFromKey, numberFromRng, pickDeterministic, createGameState, type GameState } from './gameLogic'
import { WORD_BANK, ALL_CATEGORIES, CATEGORY_CODES, CODE_TO_CATEGORY } from './constants'

export interface DeterministicGameConfig {
  gameCode: string
  players: number
  round: number
  category: string
  playerNames: string[]
}

/**
 * Generate completely deterministic game state from just a game code + config
 * Same inputs = same outputs every time, on every device
 */
export function generateDeterministicGame(config: DeterministicGameConfig): GameState {
  // Generate the base game state deterministically
  const baseGameState = createGameState(config.players, config.round, config.category)
  
  // Deterministic impostor selection based on game code + round number
  const impostorSeed = `${config.gameCode}-impostor-${config.round}`
  const impostorRng = seededRandFromKey(impostorSeed)
  const impostorIndex = numberFromRng(impostorRng, config.players)
  
  // Deterministic starting player
  const startRng = seededRandFromKey(`${config.gameCode}-start-${config.round}`)
  const startPlayerIndex = numberFromRng(startRng, config.players)
  
  return {
    ...baseGameState,
    impostorIndex,
    startPlayerIndex,
    players: config.players
  }
}

/**
 * Generate a player's unique ID based on game code + player name
 * This ensures the same player gets the same ID across devices
 */
export function getDeterministicPlayerId(gameCode: string, playerName: string): number {
  const playerSeed = `${gameCode}-player-${playerName.toLowerCase().trim()}`
  const rng = seededRandFromKey(playerSeed)
  return numberFromRng(rng, 1000000) // Generate ID between 0-999999
}

/**
 * Check if a player is the impostor deterministically
 */
export function isPlayerImpostor(gameCode: string, playerName: string, allPlayerNames: string[], round: number): boolean {
  const sortedNames = [...allPlayerNames].sort()
  const playerIndex = sortedNames.indexOf(playerName)
  
  if (playerIndex === -1) return false
  
  const impostorSeed = `${gameCode}-impostor-${round}`
  const impostorRng = seededRandFromKey(impostorSeed)
  const impostorIndex = numberFromRng(impostorRng, sortedNames.length)
  
  return playerIndex === impostorIndex
}

/**
 * Get the secret word for a specific game configuration
 */
export function getDeterministicWord(gameCode: string, category: string, round: number): string {

  // Handle "Random" category by picking a random category deterministically
  let actualCategory = category
  let words = WORD_BANK[category]

  if (category === 'Random') {
    const categorySeed = `${gameCode}-cat-${round}`
    const categoryRng = seededRandFromKey(categorySeed)
    actualCategory = pickDeterministic(categoryRng, ALL_CATEGORIES)
    words = WORD_BANK[actualCategory]
  }

  if (!words) {
    words = WORD_BANK["Gen Z Vibes"]
  }

  const wordSeed = `${gameCode}-word-${actualCategory}-${round}`
  const wordRng = seededRandFromKey(wordSeed)

  return pickDeterministic(wordRng, words)
}

/**
 * Get the starting player index deterministically
 */
export function getDeterministicStartingPlayer(gameCode: string, playerNames: string[], round: number): number {
  const sortedNames = [...playerNames].sort()
  const startSeed = `${gameCode}-start-${sortedNames.join('-')}-${round}`
  const startRng = seededRandFromKey(startSeed)
  
  return numberFromRng(startRng, sortedNames.length)
}

export interface GameCodeData {
  code: string
  players: number
  category: string
  round: number
}

/**
 * Generate game code with embedded game settings
 * Format: XXXX-PP-CC where:
 * - XXXX = 4 character random code
 * - PP = players (encoded)
 * - CC = category (encoded)
 */
export function generateGameCodeWithSettings(players: number, category: string, round: number = 1): GameCodeData {
  // Generate 4-character base code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let baseCode = ''
  for (let i = 0; i < 4; i++) {
    baseCode += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  // Encode players (3-20 -> A-R)
  const playerCode = String.fromCharCode(65 + (players - 3)) // 3->A, 4->B, etc.

  // Encode category using shared constants
  const categoryCode = CATEGORY_CODES[category] || 'Z'
  
  // Round code (1-9 -> 1-9, 10+ -> A+)
  const roundCode = round <= 9 ? round.toString() : String.fromCharCode(55 + round) // 10->A, 11->B
  
  const fullCode = `${baseCode}${playerCode}${categoryCode}${roundCode}`
  
  return {
    code: fullCode,
    players,
    category,
    round
  }
}

/**
 * Parse game code to extract settings
 */
export function parseGameCode(gameCode: string): GameCodeData | null {
  if (gameCode.length !== 7) return null
  
  try {
    const baseCode = gameCode.substring(0, 4)
    const playerCode = gameCode.charAt(4)
    const categoryCode = gameCode.charAt(5)
    const roundCode = gameCode.charAt(6)
    
    // Decode players
    const players = playerCode.charCodeAt(0) - 65 + 3 // A->3, B->4, etc.
    if (players < 3 || players > 20) return null

    // Decode category using shared constants
    const category = categoryCode === 'Z' ? 'Random' : CODE_TO_CATEGORY[categoryCode]
    if (!category) return null
    
    // Decode round
    const round = roundCode >= '1' && roundCode <= '9' 
      ? parseInt(roundCode) 
      : roundCode.charCodeAt(0) - 55 // A->10, B->11, etc.
    
    if (round < 1) return null
    
    return {
      code: baseCode,
      players,
      category,
      round
    }
  } catch {
    return null
  }
}

/**
 * Simple game code generator (6 characters) - legacy
 */
export function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Validate game code format (supports both old 6-char and new 7-char)
 */
export function isValidGameCodeFormat(gameCode: string): boolean {
  return /^[A-Z0-9]{6,7}$/.test(gameCode)
}