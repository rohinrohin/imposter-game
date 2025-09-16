import type { GameState } from './gameLogic'

export interface MultiplayerGameData {
  gameState: GameState
  playerNames: string[]
  lastUpdated: number
  hostId: string
}

// Use a simple URL-based sync approach with hash fragments
// This allows sharing state via URL without a backend
export class URLBasedSync {
  private gameCode: string
  private isHost: boolean
  private pollInterval: number | null = null
  private onUpdate: ((data: MultiplayerGameData) => void) | null = null
  
  constructor(gameCode: string, isHost: boolean = false) {
    this.gameCode = gameCode
    this.isHost = isHost
  }

  // Encode game data into URL hash
  private encodeGameData(data: MultiplayerGameData): string {
    const compressed = JSON.stringify(data)
    return btoa(compressed).replace(/[+/=]/g, (char) => {
      switch (char) {
        case '+': return '-'
        case '/': return '_'
        case '=': return ''
        default: return char
      }
    })
  }

  // Decode game data from URL hash
  private decodeGameData(encoded: string): MultiplayerGameData | null {
    try {
      const base64 = encoded.replace(/[-_]/g, (char) => char === '-' ? '+' : '/')
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
      const decompressed = atob(padded)
      return JSON.parse(decompressed)
    } catch {
      return null
    }
  }

  // Share game state via URL
  shareGameState(data: MultiplayerGameData): string {
    const encoded = this.encodeGameData(data)
    const shareUrl = `${window.location.origin}${window.location.pathname}#game=${this.gameCode}&data=${encoded}`
    
    // Update current URL if host
    if (this.isHost) {
      window.history.replaceState(null, '', shareUrl)
    }
    
    return shareUrl
  }

  // Load game state from URL
  loadFromURL(): MultiplayerGameData | null {
    const hash = window.location.hash
    if (!hash.includes(`game=${this.gameCode}`)) return null
    
    const dataMatch = hash.match(/data=([^&]+)/)
    if (!dataMatch) return null
    
    return this.decodeGameData(dataMatch[1])
  }

  // Start watching for updates (for non-host players)
  startWatching(callback: (data: MultiplayerGameData) => void) {
    this.onUpdate = callback
    
    // Check for URL changes
    const checkForUpdates = () => {
      const data = this.loadFromURL()
      if (data) {
        callback(data)
      }
    }
    
    // Poll for updates every 2 seconds (simple but effective)
    this.pollInterval = setInterval(checkForUpdates, 2000) as any
    
    // Also check immediately
    checkForUpdates()
  }

  // Stop watching
  stopWatching() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    this.onUpdate = null
  }
}

// Alternative: Use a free temporary storage service
export class CloudSync {
  private gameCode: string
  private isHost: boolean
  private pollInterval: number | null = null
  
  constructor(gameCode: string, isHost: boolean = false) {
    this.gameCode = gameCode
    this.isHost = isHost
  }

  // Use jsonbin.io or similar free service for temporary storage
  private getStorageUrl(): string {
    // Using a simple approach with GitHub Gist API or similar
    // For demo purposes, we'll use localStorage as fallback
    return `https://api.github.com/gists`
  }

  async saveGameState(data: MultiplayerGameData): Promise<boolean> {
    try {
      // For now, fall back to localStorage with a broadcast channel
      localStorage.setItem(`impostor-sync-${this.gameCode}`, JSON.stringify(data))
      
      // Use BroadcastChannel for same-origin communication
      const channel = new BroadcastChannel(`impostor-${this.gameCode}`)
      channel.postMessage(data)
      channel.close()
      
      return true
    } catch {
      return false
    }
  }

  async loadGameState(): Promise<MultiplayerGameData | null> {
    try {
      const data = localStorage.getItem(`impostor-sync-${this.gameCode}`)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  startWatching(callback: (data: MultiplayerGameData) => void) {
    // Use BroadcastChannel for real-time updates
    const channel = new BroadcastChannel(`impostor-${this.gameCode}`)
    
    channel.onmessage = (event) => {
      callback(event.data)
    }
    
    // Also poll as backup
    this.pollInterval = setInterval(async () => {
      const data = await this.loadGameState()
      if (data) {
        callback(data)
      }
    }, 3000) as any
  }

  stopWatching() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }
}

// QR Code-based sharing for easy mobile joining
export function generateQRCodeData(gameUrl: string): string {
  // Simple QR code data - in a real app you'd use a QR library
  return `Join Impostor Game: ${gameUrl}`
}

// Simple WebRTC-based P2P sync (more advanced)
export class P2PSync {
  private gameCode: string
  private isHost: boolean
  private connections: RTCPeerConnection[] = []
  private onUpdate: ((data: MultiplayerGameData) => void) | null = null
  
  constructor(gameCode: string, isHost: boolean = false) {
    this.gameCode = gameCode
    this.isHost = isHost
  }

  // Initialize WebRTC connection
  async createConnection(): Promise<RTCPeerConnection> {
    const connection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    })
    
    // Set up data channel for game state sync
    if (this.isHost) {
      const dataChannel = connection.createDataChannel('gameState')
      dataChannel.onopen = () => console.log('Data channel opened')
      dataChannel.onmessage = (event) => {
        if (this.onUpdate) {
          this.onUpdate(JSON.parse(event.data))
        }
      }
    }
    
    return connection
  }

  // Broadcast game state to all connected peers
  broadcastGameState(data: MultiplayerGameData) {
    const message = JSON.stringify(data)
    this.connections.forEach(connection => {
      const dataChannel = connection.createDataChannel('gameState')
      if (dataChannel.readyState === 'open') {
        dataChannel.send(message)
      }
    })
  }
}