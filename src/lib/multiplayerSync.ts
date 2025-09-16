import { ref, watch } from 'vue'
import type { GameState } from './gameLogic'

export interface MultiplayerState {
  gameCode: string | null
  isHost: boolean
  playerName: string | null
  playerId: number | null
  connectedPlayers: string[]
  gameMode: 'local' | 'multiplayer'
}

export interface SyncedGameData {
  gameState: GameState
  playerNames: string[]
  lastUpdated: number
  hostId: string
}

// Generate a 6-character game code
export function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Create a unique player ID
export function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Sync game state to localStorage with game code
export function syncGameState(gameCode: string, gameData: SyncedGameData): void {
  const key = `impostor-game-${gameCode}`
  localStorage.setItem(key, JSON.stringify(gameData))
  
  // Trigger storage event for other tabs/devices (same browser)
  window.dispatchEvent(new StorageEvent('storage', {
    key,
    newValue: JSON.stringify(gameData),
    storageArea: localStorage
  }))
}

// Get game state from localStorage
export function getGameState(gameCode: string): SyncedGameData | null {
  const key = `impostor-game-${gameCode}`
  const data = localStorage.getItem(key)
  if (!data) return null
  
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

// Listen for game state changes
export function watchGameState(gameCode: string, callback: (data: SyncedGameData | null) => void): () => void {
  const key = `impostor-game-${gameCode}`
  
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === key) {
      try {
        const data = e.newValue ? JSON.parse(e.newValue) : null
        callback(data)
      } catch {
        callback(null)
      }
    }
  }
  
  window.addEventListener('storage', handleStorageChange)
  
  // Also listen for custom events (for same-tab updates)
  const handleCustomEvent = () => {
    const data = getGameState(gameCode)
    callback(data)
  }
  
  window.addEventListener('gameStateUpdated', handleCustomEvent)
  
  return () => {
    window.removeEventListener('storage', handleStorageChange)
    window.removeEventListener('gameStateUpdated', handleCustomEvent)
  }
}

// Add player to game
export function addPlayerToGame(gameCode: string, playerName: string, playerId: string): boolean {
  const gameData = getGameState(gameCode)
  if (!gameData) return false
  
  // Check if player already exists
  const existingIndex = gameData.playerNames.findIndex(name => name === playerName)
  if (existingIndex !== -1) return false
  
  // Check if game is full
  if (gameData.playerNames.length >= gameData.gameState.players) return false
  
  gameData.playerNames.push(playerName)
  gameData.lastUpdated = Date.now()
  
  syncGameState(gameCode, gameData)
  return true
}

// Remove player from game
export function removePlayerFromGame(gameCode: string, playerName: string): void {
  const gameData = getGameState(gameCode)
  if (!gameData) return
  
  gameData.playerNames = gameData.playerNames.filter(name => name !== playerName)
  gameData.lastUpdated = Date.now()
  
  syncGameState(gameCode, gameData)
}

// Check if game code is valid and active
export function isValidGameCode(gameCode: string): boolean {
  const gameData = getGameState(gameCode)
  if (!gameData) return false
  
  // Check if game was updated in the last 24 hours
  const twentyFourHours = 24 * 60 * 60 * 1000
  return (Date.now() - gameData.lastUpdated) < twentyFourHours
}

// Clean up old games
export function cleanupOldGames(): void {
  const twentyFourHours = 24 * 60 * 60 * 1000
  const keys = Object.keys(localStorage)
  
  keys.forEach(key => {
    if (key.startsWith('impostor-game-')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '')
        if (Date.now() - data.lastUpdated > twentyFourHours) {
          localStorage.removeItem(key)
        }
      } catch {
        localStorage.removeItem(key)
      }
    }
  })
}

// Initialize multiplayer sync
export function useMultiplayerSync() {
  const multiplayerState = ref<MultiplayerState>({
    gameCode: null,
    isHost: false,
    playerName: null,
    playerId: null,
    connectedPlayers: [],
    gameMode: 'local'
  })
  
  // Clean up old games on init
  cleanupOldGames()
  
  return {
    multiplayerState
  }
}