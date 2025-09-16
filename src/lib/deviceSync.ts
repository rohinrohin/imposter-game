import type { GameState } from './gameLogic'

export interface SyncGameData {
  gameState: GameState
  playerNames: string[]
  lastUpdated: number
  hostId: string
}

/**
 * Real cross-device sync using URL sharing + QR codes
 * This is the most practical no-backend solution
 */
export class ShareableGameSync {
  private gameCode: string
  private isHost: boolean
  
  constructor(gameCode: string, isHost: boolean = false) {
    this.gameCode = gameCode
    this.isHost = isHost
  }

  // Create a shareable URL with embedded game state
  createShareableURL(gameData: SyncGameData): string {
    const compressed = this.compressGameData(gameData)
    const baseUrl = `${window.location.origin}${window.location.pathname}`
    return `${baseUrl}?game=${this.gameCode}&state=${compressed}`
  }

  // Extract game data from URL
  extractGameDataFromURL(): SyncGameData | null {
    const urlParams = new URLSearchParams(window.location.search)
    const gameCode = urlParams.get('game')
    const stateData = urlParams.get('state')
    
    if (gameCode !== this.gameCode || !stateData) return null
    
    return this.decompressGameData(stateData)
  }

  // Compress game data for URL
  private compressGameData(data: SyncGameData): string {
    try {
      const json = JSON.stringify(data)
      const compressed = btoa(json)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
      return compressed
    } catch {
      return ''
    }
  }

  // Decompress game data from URL
  private decompressGameData(compressed: string): SyncGameData | null {
    try {
      const base64 = compressed
        .replace(/-/g, '+')
        .replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
      const json = atob(padded)
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  // Generate QR code data for mobile sharing
  generateQRData(shareUrl: string): string {
    return shareUrl
  }
}

/**
 * Manual sync approach - Host shares updates via copy/paste
 * Most reliable cross-device method without backend
 */
export class ManualSync {
  static generateSyncCode(gameData: SyncGameData): string {
    const compressed = btoa(JSON.stringify(gameData))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    
    // Format as groups of 4 characters for easier reading
    return compressed.match(/.{1,4}/g)?.join('-') || compressed
  }

  static parseSyncCode(syncCode: string): SyncGameData | null {
    try {
      const compressed = syncCode.replace(/-/g, '')
      const base64 = compressed
        .replace(/-/g, '+')
        .replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
      const json = atob(padded)
      return JSON.parse(json)
    } catch {
      return null
    }
  }
}

/**
 * Practical hybrid approach:
 * 1. Host creates game with shareable URL
 * 2. Players join via URL (gets current state)
 * 3. Host can generate new URLs when state changes
 * 4. Players refresh or enter new sync codes to get updates
 */
export class HybridDeviceSync {
  private gameCode: string
  private isHost: boolean
  private shareableSync: ShareableGameSync
  
  constructor(gameCode: string, isHost: boolean = false) {
    this.gameCode = gameCode
    this.isHost = isHost
    this.shareableSync = new ShareableGameSync(gameCode, isHost)
  }

  // Host: Create initial join URL
  createJoinURL(gameData: SyncGameData): string {
    return this.shareableSync.createShareableURL(gameData)
  }

  // Host: Generate update code for mid-game changes
  generateUpdateCode(gameData: SyncGameData): string {
    return ManualSync.generateSyncCode(gameData)
  }

  // Player: Join from URL
  joinFromURL(): SyncGameData | null {
    return this.shareableSync.extractGameDataFromURL()
  }

  // Player: Apply update code
  applyUpdateCode(syncCode: string): SyncGameData | null {
    return ManualSync.parseSyncCode(syncCode)
  }

  // Generate QR code for easy mobile joining
  generateQRCode(url: string): string {
    return this.shareableSync.generateQRData(url)
  }
}

// Helper to detect if user joined via shared URL
export function detectSharedGame(): { gameCode: string; gameData: SyncGameData } | null {
  const urlParams = new URLSearchParams(window.location.search)
  const gameCode = urlParams.get('game')
  const stateData = urlParams.get('state')
  
  if (!gameCode || !stateData) return null
  
  try {
    const base64 = stateData
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const json = atob(padded)
    const gameData = JSON.parse(json)
    
    return { gameCode, gameData }
  } catch {
    return null
  }
}