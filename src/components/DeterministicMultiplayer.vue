<template>
  <div class="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-2xl">
      <!-- Mode Selection -->
      <div v-if="step === 'mode'" class="text-center fade-in">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-8">🎮 Imposter Game Word Generator</h1>
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
            @click="step = 'create-or-join'"
            class="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-white/40 group"
          >
            <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🌐</div>
            <h3 class="text-2xl font-bold text-white mb-2">Multiple Devices</h3>
            <p class="text-purple-200">Each player uses their own device with game code</p>
          </button>
        </div>
      </div>
      
      <!-- Create or Join -->
      <div v-else-if="step === 'create-or-join'" class="text-center fade-in">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-8">🌐 Multiplayer</h1>
        <p class="text-xl text-purple-100 mb-12">Create a game or join with a code</p>
        
        <div class="space-y-6">
          <button
            @click="createGame"
            class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl p-8 transition-all duration-300 hover:scale-105 group"
          >
            <div class="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
            <h3 class="text-2xl font-bold mb-2">Create Game</h3>
            <p class="text-green-100">Start a new game and share the code</p>
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
        <p class="text-xl text-purple-100 mb-12">Enter the game code to join</p>
        
        <div class="space-y-6">
          <div>
            <label class="block text-white text-lg font-medium mb-2">Game Code</label>
            <input
              v-model="joinCode"
              type="text"
              placeholder="Enter 6-7 character code"
              maxlength="7"
              class="w-full text-center text-2xl font-mono bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-4 focus:ring-white/20"
              @input="joinCode = joinCode.toUpperCase()"
            />
          </div>
          
          <button
            @click="joinGame"
            :disabled="!joinCode || joinCode.length < 6"
            class="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white text-xl font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
          >
            🚀 Join Game
          </button>
          
          <div v-if="joinError" class="bg-red-500/20 border border-red-500/40 rounded-xl p-4">
            <p class="text-red-200">{{ joinError }}</p>
          </div>
        </div>
        
        <button
          @click="step = 'create-or-join'"
          class="mt-8 text-purple-200 hover:text-white transition-colors duration-300"
        >
          ← Back
        </button>
      </div>
      
      <!-- Create Game -->
      <div v-else-if="step === 'create'" class="text-center fade-in">
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-8">🎯 Create Game</h1>
        <p class="text-xl text-purple-100 mb-8">Configure your game settings</p>
        
        <!-- Game Settings -->
        <div class="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 mb-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Players -->
            <div>
              <label class="block text-white text-sm font-medium mb-2">Players</label>
              <input
                v-model.number="gameSettings.players"
                type="number"
                min="3"
                max="20"
                class="w-full text-center bg-white/10 border border-white/20 rounded-lg p-2 text-white"
                @input="updateGameCode"
              />
            </div>
            
            <!-- Category -->
            <div>
              <label class="block text-white text-sm font-medium mb-2">Category</label>
              <select
                v-model="gameSettings.category"
                class="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white"
                @change="updateGameCode"
              >
                <option value="Random">🎲 Random</option>
                <option value="Gen Z Vibes">Gen Z Vibes</option>
                <option value="Psychedelic Trip">Psychedelic Trip</option>
                <option value="Viral Internet">Viral Internet</option>
                <option value="Fantasy Realms">Fantasy Realms</option>
                <option value="Street Food">Street Food</option>
                <option value="Retro Gaming">Retro Gaming</option>
                <option value="Space Odyssey">Space Odyssey</option>
                <option value="Urban Legends">Urban Legends</option>
                <option value="Coffee Culture">Coffee Culture</option>
                <option value="Extreme Sports">Extreme Sports</option>
                <option value="Mystical Artifacts">Mystical Artifacts</option>
                <option value="Dystopian Future">Dystopian Future</option>
                <option value="Comfort Things">Comfort Things</option>
                <option value="Ocean Mysteries">Ocean Mysteries</option>
                <option value="Cozy Aesthetics">Cozy Aesthetics</option>
                <option value="Indian">Indian</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Game Code Display (Multiplayer only) -->
        <div v-if="currentMode === 'multiplayer'" class="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 mb-8">
          <p class="text-lg text-purple-200 mb-4">Smart Game Code</p>
          <div class="text-5xl font-mono font-bold text-white mb-4 tracking-wider">
            {{ gameCode }}
          </div>
          <p class="text-sm text-purple-300 mb-4">
            Contains: {{ gameSettings.players }} players, {{ gameSettings.category }} category
          </p>
          <button
            @click="copyGameCode"
            class="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-colors duration-300"
          >
            📋 Copy Code
          </button>
        </div>
        
        <!-- Action Button -->
        <div class="space-y-4">
          <button
            v-if="currentMode === 'multiplayer'"
            @click="startAsHost"
            class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xl font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            🚀 Start Game as Host
          </button>
          
          <button
            v-else
            @click="startLocalGame"
            class="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xl font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            🚀 Start Single Player Game
          </button>
        </div>
        
        <div v-if="currentMode === 'multiplayer'" class="mt-8 bg-blue-500/20 border border-blue-500/40 rounded-xl p-4">
          <p class="text-blue-200 text-sm">
            💡 <strong>Smart Code:</strong> Players who join will automatically get your game settings - no setup needed!
          </p>
        </div>
        
        <button
          @click="step = currentMode === 'multiplayer' ? 'create-or-join' : 'mode'"
          class="mt-8 text-purple-200 hover:text-white transition-colors duration-300"
        >
          ← Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { generateGameCodeWithSettings, parseGameCode, isValidGameCodeFormat, type GameCodeData } from '@/lib/deterministicMultiplayer'

const emit = defineEmits<{
  selectMode: [mode: 'local' | 'multiplayer']
  joinedGame: [gameCode: string, isHost: boolean, gameSettings?: GameCodeData]
  startLocalGame: [players: number, category: string]
}>()

const step = ref<'mode' | 'create-or-join' | 'join' | 'create'>('mode')
const currentMode = ref<'local' | 'multiplayer'>('local')
const joinCode = ref('')
const gameCode = ref('')
const joinError = ref('')
const gameSettings = ref({
  players: 5,
  category: 'Random',
  round: 1
})

function selectMode(mode: 'local' | 'multiplayer') {
  currentMode.value = mode
  if (mode === 'local') {
    step.value = 'create'
  } else {
    step.value = 'create-or-join'
  }
}

function createGame() {
  currentMode.value = 'multiplayer'
  updateGameCode()
  step.value = 'create'
}

function updateGameCode() {
  const codeData = generateGameCodeWithSettings(
    gameSettings.value.players,
    gameSettings.value.category,
    gameSettings.value.round
  )
  gameCode.value = codeData.code
}

function joinGame() {
  joinError.value = ''
  
  if (!isValidGameCodeFormat(joinCode.value)) {
    joinError.value = 'Game code must be 6-7 characters (letters and numbers)'
    return
  }
  
  // Try to parse game settings from code
  const gameSettings = parseGameCode(joinCode.value)
  
  emit('joinedGame', joinCode.value, false, gameSettings || undefined)
}

function startAsHost() {
  const hostGameSettings: GameCodeData = {
    code: gameCode.value,
    players: gameSettings.value.players,
    category: gameSettings.value.category,
    round: gameSettings.value.round
  }
  emit('joinedGame', gameCode.value, true, hostGameSettings)
}

function startLocalGame() {
  emit('startLocalGame', gameSettings.value.players, gameSettings.value.category)
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
</script>