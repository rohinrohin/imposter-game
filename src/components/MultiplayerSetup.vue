<template>
  <div class="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-2xl">
      <!-- Mode Selection -->
      <div v-if="step === 'mode'" class="text-center fade-in">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-8">🎮 Game Mode</h1>
        <p class="text-xl text-purple-100 mb-12">Choose how you want to play</p>
        
        <div class="space-y-6">
          <button
            @click="selectMode('local')"
            class="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-white/40 group"
          >
            <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📱</div>
            <h3 class="text-2xl font-bold text-white mb-2">Single Device</h3>
            <p class="text-purple-200">Pass the device around to each player</p>
          </button>
          
          <button
            @click="selectMode('multiplayer')"
            class="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-white/40 group"
          >
            <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🌐</div>
            <h3 class="text-2xl font-bold text-white mb-2">Multiple Devices</h3>
            <p class="text-purple-200">Each player joins from their own phone/device</p>
          </button>
        </div>
      </div>
      
      <!-- Host or Join -->
      <div v-else-if="step === 'hostOrJoin'" class="text-center fade-in">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-8">🌐 Multiplayer</h1>
        <p class="text-xl text-purple-100 mb-12">Create a new game or join an existing one</p>
        
        <div class="space-y-6">
          <button
            @click="createGame"
            class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl p-8 transition-all duration-300 hover:scale-105 group"
          >
            <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
            <h3 class="text-2xl font-bold mb-2">Create Game</h3>
            <p class="text-green-100">Start a new game and get a game code</p>
          </button>
          
          <button
            @click="step = 'join'"
            class="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl p-8 transition-all duration-300 hover:scale-105 group"
          >
            <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔗</div>
            <h3 class="text-2xl font-bold mb-2">Join Game</h3>
            <p class="text-blue-100">Enter a game code to join</p>
          </button>
        </div>
        
        <button
          @click="step = 'mode'"
          class="mt-8 text-purple-200 hover:text-white transition-colors duration-300"
        >
          ← Back to mode selection
        </button>
      </div>
      
      <!-- Join Game -->
      <div v-else-if="step === 'join'" class="text-center fade-in">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-8">🔗 Join Game</h1>
        <p class="text-xl text-purple-100 mb-12">Enter the game code and your name</p>
        
        <div class="space-y-6">
          <div>
            <label class="block text-white text-lg font-medium mb-2">Game Code</label>
            <input
              v-model="joinCode"
              type="text"
              placeholder="Enter 6-character code"
              maxlength="6"
              class="w-full text-center text-2xl font-mono bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-4 focus:ring-white/20"
              @input="joinCode = joinCode.toUpperCase()"
            />
          </div>
          
          <div>
            <label class="block text-white text-lg font-medium mb-2">Your Name</label>
            <input
              v-model="playerName"
              type="text"
              placeholder="Enter your name"
              maxlength="20"
              class="w-full text-center text-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-4 focus:ring-white/20"
            />
          </div>
          
          <button
            @click="joinGame"
            :disabled="!joinCode || joinCode.length !== 6 || !playerName"
            class="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white text-xl font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
          >
            🚀 Join Game
          </button>
          
          <div v-if="joinError" class="bg-red-500/20 border border-red-500/40 rounded-xl p-4">
            <p class="text-red-200">{{ joinError }}</p>
          </div>
        </div>
        
        <button
          @click="step = 'hostOrJoin'"
          class="mt-8 text-purple-200 hover:text-white transition-colors duration-300"
        >
          ← Back
        </button>
      </div>
      
      <!-- Host Setup -->
      <div v-else-if="step === 'host'" class="text-center fade-in">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-8">🎯 Host Game</h1>
        <p class="text-xl text-purple-100 mb-8">Share this code with other players</p>
        
        <!-- Game Code Display -->
        <div class="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 mb-8">
          <p class="text-lg text-purple-200 mb-4">Game Code</p>
          <div class="text-5xl font-mono font-bold text-white mb-4 tracking-wider">
            {{ gameCode }}
          </div>
          <button
            @click="copyGameCode"
            class="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-colors duration-300"
          >
            📋 Copy Code
          </button>
        </div>
        
        <!-- Player List -->
        <div class="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 mb-8">
          <h3 class="text-xl font-bold text-white mb-4">Players ({{ connectedPlayers.length }}/{{ maxPlayers }})</h3>
          <div class="space-y-2">
            <div v-for="(player, index) in connectedPlayers" :key="index" class="bg-white/10 rounded-lg p-3">
              <span class="text-white font-medium">{{ player }}</span>
              <span v-if="index === 0" class="text-yellow-300 ml-2">👑 Host</span>
            </div>
          </div>
        </div>
        
        <button
          @click="startMultiplayerGame"
          :disabled="connectedPlayers.length < 3"
          class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white text-xl font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
        >
          🚀 Start Game (Need {{ Math.max(0, 3 - connectedPlayers.length) }} more players)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  generateGameCode, 
  generatePlayerId, 
  syncGameState, 
  getGameState, 
  watchGameState,
  addPlayerToGame,
  isValidGameCode,
  type SyncedGameData 
} from '@/lib/multiplayerSync'
import type { GameState } from '@/lib/gameLogic'

const emit = defineEmits<{
  selectMode: [mode: 'local' | 'multiplayer']
  joinedGame: [gameCode: string, playerName: string, playerId: string, isHost: boolean]
}>()

const step = ref<'mode' | 'hostOrJoin' | 'join' | 'host'>('mode')
const joinCode = ref('')
const playerName = ref('')
const joinError = ref('')
const gameCode = ref('')
const connectedPlayers = ref<string[]>([])
const maxPlayers = ref(8)

let unwatchGame: (() => void) | null = null

function selectMode(mode: 'local' | 'multiplayer') {
  if (mode === 'local') {
    emit('selectMode', 'local')
  } else {
    step.value = 'hostOrJoin'
  }
}

function createGame() {
  gameCode.value = generateGameCode()
  const hostName = `Host-${Math.random().toString(36).substring(2, 6)}`
  const playerId = generatePlayerId()
  
  // Create initial game data
  const gameData: SyncedGameData = {
    gameState: {
      players: maxPlayers.value,
      round: 1,
      category: 'Everyday',
      activePlayer: null,
      revealed: false,
      impostorIndex: 0,
      chosenWord: '',
      startPlayerIndex: 0,
      gameStarted: false
    },
    playerNames: [hostName],
    lastUpdated: Date.now(),
    hostId: playerId
  }
  
  syncGameState(gameCode.value, gameData)
  connectedPlayers.value = [hostName]
  playerName.value = hostName
  
  // Watch for new players
  unwatchGame = watchGameState(gameCode.value, (data) => {
    if (data) {
      connectedPlayers.value = data.playerNames
    }
  })
  
  step.value = 'host'
}

async function joinGame() {
  joinError.value = ''
  
  if (!isValidGameCode(joinCode.value)) {
    joinError.value = 'Invalid or expired game code'
    return
  }
  
  const playerId = generatePlayerId()
  const success = addPlayerToGame(joinCode.value, playerName.value, playerId)
  
  if (!success) {
    joinError.value = 'Could not join game. It may be full or the name is taken.'
    return
  }
  
  emit('joinedGame', joinCode.value, playerName.value, playerId, false)
}

function startMultiplayerGame() {
  if (connectedPlayers.value.length >= 3) {
    const playerId = generatePlayerId()
    emit('joinedGame', gameCode.value, playerName.value, playerId, true)
  }
}

async function copyGameCode() {
  try {
    await navigator.clipboard.writeText(gameCode.value)
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = gameCode.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

onUnmounted(() => {
  if (unwatchGame) {
    unwatchGame()
  }
})
</script>