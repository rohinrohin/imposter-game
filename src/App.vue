<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <!-- Deterministic Multiplayer Setup Modal -->
    <DeterministicMultiplayer 
      v-if="showModeSelection"
      @select-mode="handleModeSelection"
      @joined-game="handleJoinedGame"
    />
    
    <div class="mx-auto max-w-4xl space-y-6">
      <!-- Header -->
      <div class="text-center py-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">🕵️ Impostor Word Game</h1>
        <p class="text-gray-600">Find the impostor who doesn't know the secret word!</p>
        
        <!-- Multiplayer Status -->
        <div v-if="multiplayerState.gameMode === 'multiplayer'" class="mt-4">
          <div class="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>🌐 Multiplayer</span>
            <span>•</span>
            <span>{{ multiplayerState.gameCode }}</span>
            <span>•</span>
            <span>Round {{ gameState.round }}</span>
            <span v-if="multiplayerState.isHost">• 👑 Host</span>
          </div>
          <p class="text-sm text-gray-500 mt-2">
            {{ gameState.category }} category • {{ gameState.players }} players
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Same code = Same game setup on all devices
          </p>
        </div>
      </div>

      <!-- Game Rules Modal (shown on first visit) -->
      <div v-if="showRules" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card class="max-w-md w-full fade-in">
          <CardHeader>
            <CardTitle>🎯 How to Play</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-3 text-sm">
              <div class="flex items-start space-x-2">
                <span class="text-blue-500 font-bold">1.</span>
                <span>Each player (except the impostor) gets the same secret word</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-blue-500 font-bold">2.</span>
                <span>The impostor doesn't know the word and must blend in</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-blue-500 font-bold">3.</span>
                <span>Players take turns describing the word without saying it</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-blue-500 font-bold">4.</span>
                <span>After discussion, vote to eliminate the impostor!</span>
              </div>
            </div>
            <Button @click="showRules = false" class="w-full">
              Got it! Let's play 🎮
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Game Setup (hidden in multiplayer mode with smart codes) -->
      <Card v-if="shouldShowGameSetup" class="fade-in">
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <Users class="h-5 w-5" />
            <span>Game Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Players -->
          <div class="space-y-2">
            <Label class="text-base font-medium">Number of Players</Label>
            <div class="flex items-center space-x-4">
              <Input
                v-model.number="gameState.players"
                type="number"
                min="3"
                max="20"
                class="w-20"
                @input="updateGameState"
              />
              <span class="text-sm text-gray-600">
                ({{ gameState.players }} players: {{ gameState.players - 1 }} know the word, 1 impostor)
              </span>
            </div>
          </div>

          <!-- Category -->
          <div class="space-y-2">
            <Label class="text-base font-medium">Category</Label>
            <Select v-model="gameState.category" @update:model-value="updateGameState">
              <option v-for="cat in ALL_CATEGORIES" :key="cat" :value="cat">
                {{ cat }} ({{ WORD_BANK[cat].length }} words)
              </option>
            </Select>
          </div>

          <!-- Round -->
          <div class="space-y-2">
            <Label class="text-base font-medium">Round</Label>
            <div class="flex items-center space-x-4">
              <Input
                v-model.number="gameState.round"
                type="number"
                min="1"
                class="w-20"
                @input="updateGameState"
              />
              <Button variant="secondary" @click="nextRound" class="flex items-center space-x-2">
                <RotateCcw class="h-4 w-4" />
                <span>Next Round</span>
              </Button>
            </div>
          </div>

          <!-- Game Info -->
          <div class="bg-blue-50 rounded-lg p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-medium">Round:</span>
              <span class="text-blue-600 font-bold">{{ gameState.round }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-medium">Starting Player:</span>
              <span class="text-blue-600 font-bold">Player {{ gameState.startPlayerIndex + 1 }}</span>
            </div>
          </div>

          <!-- Game Actions -->
          <div class="flex flex-wrap gap-3">
            <Button 
              v-if="!gameState.gameStarted" 
              @click="startGame" 
              size="lg" 
              class="flex-1 pulse-animation"
            >
              🚀 Start Game
            </Button>
            <Button 
              v-if="gameState.gameStarted"
              @click="resetGame" 
              variant="outline"
              class="flex-1"
            >
              🔄 Reset Game
            </Button>
            <Button @click="showRules = true" variant="ghost">
              📖 Rules
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Multiplayer Game Summary (shown instead of setup) -->
      <Card v-if="multiplayerState.gameMode === 'multiplayer'" class="fade-in">
        <CardHeader>
          <CardTitle class="flex items-center space-x-2">
            <Users class="h-5 w-5" />
            <span>Game Ready</span>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="bg-green-50 rounded-lg p-4 space-y-2">
            <h3 class="font-medium text-green-800 mb-3">Settings from Game Code:</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Players:</span>
                <span class="font-bold text-green-700">{{ gameState.players }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Category:</span>
                <span class="font-bold text-green-700">{{ gameState.category }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Round:</span>
                <span class="font-bold text-green-700">{{ gameState.round }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Starting Player:</span>
                <span class="font-bold text-green-700">Player {{ gameState.startPlayerIndex + 1 }}</span>
              </div>
            </div>
          </div>
          
          <!-- Game Actions -->
          <div class="flex flex-wrap gap-3">
            <Button 
              v-if="!gameState.gameStarted" 
              @click="startGame" 
              size="lg" 
              class="flex-1 pulse-animation"
            >
              🚀 Start Game
            </Button>
            <Button 
              v-if="gameState.gameStarted"
              @click="resetGame" 
              variant="outline"
              class="flex-1"
            >
              🔄 Reset Game
            </Button>
            <Button @click="showRules = true" variant="ghost">
              📖 Rules
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Full-Screen Player Selection (only shown when game is started and no active player) -->
      <div v-if="gameState.gameStarted && gameState.activePlayer === null && multiplayerState.gameMode === 'local'" class="fixed inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center z-50 p-4">
        <div class="w-full max-w-6xl">
          <!-- Header -->
          <div class="text-center mb-8 fade-in">
            <h2 class="text-4xl md:text-6xl font-bold text-white mb-4">
              🎭 Choose Your Player
            </h2>
            <p class="text-xl md:text-2xl text-blue-100 mb-2">
              Tap your player number to reveal your word
            </p>
            <p class="text-lg text-blue-200">
              👑 Player {{ gameState.startPlayerIndex + 1 }} starts the discussion
            </p>
          </div>

          <!-- Player Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            <button
              v-for="(_, idx) in Array.from({ length: gameState.players })"
              :key="idx"
              @click="selectPlayerFullscreen(idx)"
              class="group relative bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:border-white/40 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/30"
              :class="{
                'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-2xl transform scale-105': idx === gameState.startPlayerIndex,
                'animate-pulse': idx === gameState.startPlayerIndex
              }"
            >
              <!-- Crown for starting player -->
              <div v-if="idx === gameState.startPlayerIndex" class="absolute -top-3 -right-3 text-3xl md:text-4xl animate-bounce">
                👑
              </div>
              
              <!-- Player Avatar -->
              <div class="text-4xl md:text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">
                🎭
              </div>
              
              <!-- Player Number -->
              <div class="text-2xl md:text-3xl font-bold text-white group-hover:text-yellow-200 transition-colors duration-300">
                Player {{ idx + 1 }}
              </div>
              
              <!-- Starting player indicator -->
              <div v-if="idx === gameState.startPlayerIndex" class="text-sm md:text-base text-yellow-100 font-medium mt-2">
                Goes First!
              </div>
              
              <!-- Hover effect overlay -->
              <div class="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <!-- Ripple effect -->
              <div class="absolute inset-0 rounded-2xl overflow-hidden">
                <div class="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 rounded-full"></div>
              </div>
            </button>
          </div>

          <!-- Instructions -->
          <div class="text-center mt-8 fade-in">
            <p class="text-blue-100 text-lg">
              Each player should tap their own number privately
            </p>
          </div>
        </div>
      </div>

      <!-- Multiplayer Player Identity Selection -->
      <div v-if="gameState.gameStarted && multiplayerState.gameMode === 'multiplayer' && multiplayerState.selectedPlayerIndex === null" class="fixed inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center z-50 p-4">
        <div class="w-full max-w-6xl">
          <!-- Header -->
          <div class="text-center mb-8 fade-in">
            <h2 class="text-4xl md:text-6xl font-bold text-white mb-4">
              🎭 Which Player Are You?
            </h2>
            <p class="text-xl md:text-2xl text-blue-100 mb-2">
              Select your player number to see your role
            </p>
            <p class="text-lg text-blue-200">
              👑 Player {{ gameState.startPlayerIndex + 1 }} starts the discussion
            </p>
            <div class="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-2xl mx-auto">
              <p class="text-blue-100 text-sm">
                Game Code: <strong>{{ multiplayerState.gameCode }}</strong> | Round: <strong>{{ gameState.round }}</strong>
              </p>
            </div>
          </div>

          <!-- Player Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            <button
              v-for="(_, idx) in Array.from({ length: gameState.players })"
              :key="idx"
              @click="selectMultiplayerPlayerIdentity(idx)"
              class="group relative bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:border-white/40 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/30"
              :class="{
                'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-2xl transform scale-105': idx === gameState.startPlayerIndex,
                'animate-pulse': idx === gameState.startPlayerIndex
              }"
            >
              <!-- Crown for starting player -->
              <div v-if="idx === gameState.startPlayerIndex" class="absolute -top-3 -right-3 text-3xl md:text-4xl animate-bounce">
                👑
              </div>
              
              <!-- Player Avatar -->
              <div class="text-4xl md:text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">
                🎭
              </div>
              
              <!-- Player Number -->
              <div class="text-2xl md:text-3xl font-bold text-white group-hover:text-yellow-200 transition-colors duration-300">
                Player {{ idx + 1 }}
              </div>
              
              <!-- Starting player indicator -->
              <div v-if="idx === gameState.startPlayerIndex" class="text-sm md:text-base text-yellow-100 font-medium mt-2">
                Goes First!
              </div>
              
              <!-- Hover effect overlay -->
              <div class="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <!-- Ripple effect -->
              <div class="absolute inset-0 rounded-2xl overflow-hidden">
                <div class="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 rounded-full"></div>
              </div>
            </button>
          </div>

          <!-- Instructions -->
          <div class="text-center mt-8 fade-in">
            <p class="text-blue-100 text-lg">
              Tap the number that represents YOU in this game
            </p>
            <p class="text-blue-200 text-sm mt-2">
              Each player should select their own number on their device
            </p>
          </div>
        </div>
      </div>

      <!-- Multiplayer Personal Role Display -->
      <div v-if="gameState.gameStarted && multiplayerState.gameMode === 'multiplayer' && multiplayerState.selectedPlayerIndex !== null" class="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-50 p-4">
        <div class="w-full max-w-4xl text-center fade-in">
          <!-- Show if player is impostor -->
          <div v-if="multiplayerState.selectedPlayerIndex === gameState.impostorIndex" class="space-y-8">
            <div class="text-8xl md:text-9xl animate-pulse">🕵️</div>
            <h2 class="text-5xl md:text-7xl font-bold text-red-500 animate-pulse mb-6">
              YOU ARE THE
            </h2>
            <h1 class="text-6xl md:text-8xl font-black text-red-400 mb-8 animate-bounce">
              IMPOSTOR!
            </h1>
            <div class="bg-red-900/30 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
              <p class="text-xl md:text-2xl text-red-200 mb-4">
                You don't know the secret word
              </p>
              <p class="text-lg md:text-xl text-red-300">
                🎯 Listen carefully and blend in<br/>
                🤫 Try to figure out the word<br/>
                🏃‍♂️ Avoid being caught!
              </p>
            </div>
            <div class="bg-yellow-900/30 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-4 max-w-xl mx-auto">
              <p class="text-yellow-200 text-sm">
                👑 Player {{ gameState.startPlayerIndex + 1 }} goes first in the discussion
              </p>
            </div>
          </div>
          
          <!-- Show word for regular players -->
          <div v-else class="space-y-8">
            <div class="text-6xl md:text-8xl mb-6">🎭</div>
            <h2 class="text-3xl md:text-4xl text-white mb-4">Your secret word is:</h2>
            <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <p class="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-wider animate-pulse">
                {{ gameState.chosenWord }}
              </p>
            </div>
            <div class="bg-blue-900/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
              <p class="text-lg md:text-xl text-blue-200">
                💡 <strong>Remember:</strong> Describe it without saying the word directly!
              </p>
            </div>
            <div class="bg-yellow-900/30 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-4 max-w-xl mx-auto">
              <p class="text-yellow-200 text-sm">
                👑 Player {{ gameState.startPlayerIndex + 1 }} goes first in the discussion
              </p>
              <p class="text-yellow-100 text-xs mt-2">
                🎯 Round {{ gameState.round }} • {{ gameState.category }} category
              </p>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-wrap justify-center gap-4 mt-12">
            <button 
              @click="resetMultiplayerSelection"
              class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-400"
            >
              🔄 Choose Different Player
            </button>
            <button 
              @click="startNextRound"
              class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400"
            >
              ➡️ Next Round
            </button>
          </div>
          
          <!-- Multiplayer Round Instructions -->
          <div v-if="multiplayerState.gameMode === 'multiplayer'" class="mt-8 bg-blue-900/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4 max-w-2xl mx-auto">
            <p class="text-blue-200 text-sm text-center">
              💡 <strong>Multiplayer Tip:</strong> When ready for next round, everyone should tap "Next Round" on their device to get Round {{ gameState.round + 1 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Full-Screen Word Reveal Panel -->
      <div v-if="gameState.activePlayer !== null" class="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-50 p-4">
        <div class="w-full max-w-4xl text-center">
          <div v-if="!gameState.revealed" class="fade-in">
            <!-- Privacy Screen -->
            <div class="mb-8">
              <h2 class="text-4xl md:text-6xl font-bold text-white mb-4">
                🎭 Player {{ gameState.activePlayer + 1 }}
              </h2>
              <p class="text-xl md:text-2xl text-gray-300 mb-8">
                <span v-if="multiplayerState.gameMode === 'multiplayer'">
                  Make sure only Player {{ gameState.activePlayer + 1 }} can see this
                </span>
                <span v-else>
                  Make sure only you can see the screen
                </span>
              </p>
            </div>
            
            <!-- Large Reveal Button -->
            <button 
              @click="revealWord" 
              class="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-2xl md:text-3xl font-bold py-8 px-16 rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300"
            >
              <div class="flex items-center space-x-4">
                <span class="text-4xl md:text-5xl group-hover:animate-bounce">👀</span>
                <span>Tap to Reveal</span>
              </div>
            </button>
            
            <p class="text-gray-400 mt-6 text-lg">
              Tap anywhere on the button when you're ready
            </p>
          </div>
          
          <div v-else class="fade-in">
            <!-- Impostor Reveal -->
            <div v-if="gameState.activePlayer === gameState.impostorIndex" class="space-y-8">
              <div class="text-8xl md:text-9xl animate-pulse">🕵️</div>
              <h2 class="text-5xl md:text-7xl font-bold text-red-500 animate-pulse mb-6">
                YOU ARE THE
              </h2>
              <h1 class="text-6xl md:text-8xl font-black text-red-400 mb-8 animate-bounce">
                IMPOSTOR!
              </h1>
              <div class="bg-red-900/30 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
                <p class="text-xl md:text-2xl text-red-200 mb-4">
                  You don't know the secret word
                </p>
                <p class="text-lg md:text-xl text-red-300">
                  🎯 Listen carefully and blend in<br/>
                  🤫 Try to figure out the word<br/>
                  🏃‍♂️ Avoid being caught!
                </p>
              </div>
            </div>
            
            <!-- Regular Player Reveal -->
            <div v-else class="space-y-8">
              <div class="text-6xl md:text-8xl mb-6">🎭</div>
              <h2 class="text-3xl md:text-4xl text-white mb-4">Your secret word is:</h2>
              <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <p class="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-wider animate-pulse">
                  {{ gameState.chosenWord }}
                </p>
              </div>
              <div class="bg-blue-900/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
                <p class="text-lg md:text-xl text-blue-200">
                  💡 <strong>Remember:</strong> Describe it without saying the word directly!
                </p>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-wrap justify-center gap-4 mt-12">
              <button 
                v-if="hasMorePlayers"
                @click="nextPlayer"
                class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400"
              >
                ➡️ Next Player
              </button>
              <button 
                v-else
                @click="hideWord"
                class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-400"
              >
                🎮 Back to Player Selection
              </button>
              <button 
                @click="startNextRound"
                class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-400"
              >
                🎯 Next Round
              </button>
            </div>
          </div>
        </div>
      </div>


      <!-- Footer -->
      <div class="text-center text-gray-500 text-sm py-4">
        <p>Have fun finding the impostor! 🕵️‍♂️🕵️‍♀️</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import { Users, RotateCcw } from 'lucide-vue-next'
import { WORD_BANK, ALL_CATEGORIES, createGameState, type GameState, numberFromRng, seededRandFromKey } from '@/lib/gameLogic'
import { 
  generateDeterministicGame, 
  getDeterministicWord,
  type DeterministicGameConfig,
  type GameCodeData
} from '@/lib/deterministicMultiplayer'
import DeterministicMultiplayer from '@/components/DeterministicMultiplayer.vue'

// Reactive state
const showRules = useLocalStorage('impostor-game-show-rules', true)
const gameState = ref<GameState>(createGameState(5, 1, ALL_CATEGORIES[0]))
const showModeSelection = ref(true)

// Deterministic multiplayer state
const multiplayerState = ref({
  gameCode: null as string | null,
  isHost: false,
  gameMode: 'local' as 'local' | 'multiplayer',
  selectedPlayerIndex: null as number | null
})

// Computed properties
const hasMorePlayers = computed(() => {
  if (gameState.value.activePlayer === null) return false
  return gameState.value.activePlayer < gameState.value.players - 1
})

const shouldShowGameSetup = computed(() => {
  // Hide setup in multiplayer mode (settings come from smart game code)
  return multiplayerState.value.gameMode === 'local'
})

// Methods
function updateGameState() {
  // Ensure valid player count
  gameState.value.players = Math.max(3, Math.min(20, gameState.value.players))
  gameState.value.round = Math.max(1, gameState.value.round)
  
  // Recreate game state with new parameters
  const newState = createGameState(
    gameState.value.players,
    gameState.value.round,
    gameState.value.category
  )
  
  // Preserve UI state
  newState.activePlayer = gameState.value.activePlayer
  newState.revealed = gameState.value.revealed
  newState.gameStarted = gameState.value.gameStarted
  
  // Validate active player is still in range
  if (newState.activePlayer !== null && newState.activePlayer >= newState.players) {
    newState.activePlayer = null
    newState.revealed = false
  }
  
  // Always recalculate starting player when players change to be deterministic
  const roomKey = `${newState.round}#${newState.players}#${newState.category}`
  newState.startPlayerIndex = numberFromRng(seededRandFromKey(roomKey + ':start'), newState.players)
  
  gameState.value = newState
  
}

function startGame() {
  gameState.value.gameStarted = true
  gameState.value.activePlayer = null
  gameState.value.revealed = false
}


function selectPlayerFullscreen(playerIndex: number) {
  gameState.value.activePlayer = playerIndex
  gameState.value.revealed = false
}

function revealWord() {
  gameState.value.revealed = true
}

function hideWord() {
  gameState.value.revealed = false
  gameState.value.activePlayer = null
}

function nextPlayer() {
  if (gameState.value.activePlayer !== null && gameState.value.activePlayer < gameState.value.players - 1) {
    gameState.value.activePlayer = gameState.value.activePlayer + 1
    gameState.value.revealed = false
  }
}

function nextRound() {
  gameState.value.round += 1
  updateDeterministicGameState()
  gameState.value.activePlayer = null
  gameState.value.revealed = false
}

function resetGame() {
  gameState.value.gameStarted = false
  gameState.value.activePlayer = null
  gameState.value.revealed = false
  gameState.value.round = 1
  updateDeterministicGameState()
}

// Deterministic multiplayer functions
function handleModeSelection(mode: 'local' | 'multiplayer') {
  multiplayerState.value.gameMode = mode
  showModeSelection.value = false
  
  if (mode === 'local') {
    // Continue with local game
    return
  }
}

function handleJoinedGame(gameCode: string, isHost: boolean, gameSettings?: GameCodeData) {
  multiplayerState.value.gameCode = gameCode
  multiplayerState.value.isHost = isHost
  multiplayerState.value.gameMode = 'multiplayer'
  showModeSelection.value = false
  
  // If joining with smart game code, apply the settings automatically
  if (gameSettings) {
    gameState.value.players = gameSettings.players
    gameState.value.category = gameSettings.category
    gameState.value.round = gameSettings.round
  }
  
  // Generate deterministic game state from game code
  generateDeterministicGameFromCode()
}

function generateDeterministicGameFromCode() {
  if (!multiplayerState.value.gameCode) return
  
  // Create deterministic game config
  const config: DeterministicGameConfig = {
    gameCode: multiplayerState.value.gameCode,
    players: gameState.value.players,
    round: gameState.value.round,
    category: gameState.value.category,
    playerNames: [] // No player names needed
  }
  
  // Generate deterministic game state
  const deterministicGame = generateDeterministicGame(config)
  
  // Override the current game state with deterministic values
  gameState.value = {
    ...gameState.value,
    impostorIndex: deterministicGame.impostorIndex,
    startPlayerIndex: deterministicGame.startPlayerIndex,
    chosenWord: getDeterministicWord(config.gameCode, config.category, config.round)
  }
}

// Update game state generation to be deterministic in multiplayer mode
function updateDeterministicGameState() {
  if (multiplayerState.value.gameMode === 'multiplayer') {
    generateDeterministicGameFromCode()
  } else {
    updateGameState()
  }
}

// Multiplayer player identity selection
function selectMultiplayerPlayerIdentity(playerIndex: number) {
  multiplayerState.value.selectedPlayerIndex = playerIndex
}

function resetMultiplayerSelection() {
  multiplayerState.value.selectedPlayerIndex = null
}

function startNextRound() {
  // Increment round for new word/impostor
  gameState.value.round += 1
  
  // Reset UI state
  gameState.value.activePlayer = null
  gameState.value.revealed = false
  multiplayerState.value.selectedPlayerIndex = null
  
  // Regenerate game state with new round (deterministic for all players with same code)
  updateDeterministicGameState()
  
  // In multiplayer mode, everyone with the same game code will get the same new round
  // when they manually increment their round counter
}

// Initialize
onMounted(() => {
  updateGameState()
})

</script>