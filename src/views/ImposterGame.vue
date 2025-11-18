<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <!-- Deterministic Multiplayer Setup Modal -->
    <DeterministicMultiplayer
      v-if="showModeSelection"
      @select-mode="handleModeSelection"
      @joined-game="handleJoinedGame"
      @start-local-game="handleStartLocalGame"
    />

    <div class="mx-auto max-w-4xl space-y-6">
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

      <!-- Local Mode: Player Selection -->
      <PlayerGrid
        v-if="gameState.gameStarted && gameState.activePlayer === null && multiplayerState.gameMode === 'local'"
        title="🎭 Choose Your Player"
        subtitle="Tap your player number to reveal your word"
        :player-count="gameState.players"
        :start-player-index="gameState.startPlayerIndex"
        instructions="Each player should tap their own number privately"
        @select-player="selectPlayer"
      />

      <!-- Multiplayer Mode: Player Identity Selection -->
      <PlayerGrid
        v-if="gameState.gameStarted && multiplayerState.gameMode === 'multiplayer' && multiplayerState.selectedPlayerIndex === null"
        title="🎭 Which Player Are You?"
        subtitle="Select your player number to see your role"
        :player-count="gameState.players"
        :start-player-index="gameState.startPlayerIndex"
        instructions="Tap the number that represents YOU in this game"
        secondary-instructions="Each player should select their own number on their device"
        :game-info="`Game Code: <strong>${multiplayerState.gameCode}</strong> | Round: <strong>${gameState.round}</strong>`"
        @select-player="selectMultiplayerPlayerIdentity"
      />

      <!-- Multiplayer Personal Role Display -->
      <div v-if="gameState.gameStarted && multiplayerState.gameMode === 'multiplayer' && multiplayerState.selectedPlayerIndex !== null" class="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-50 p-4">
        <div class="w-full max-w-4xl text-center fade-in">
          <RoleReveal
            :is-impostor="multiplayerState.selectedPlayerIndex === gameState.impostorIndex"
            :word="gameState.chosenWord"
            :start-player-index="gameState.startPlayerIndex"
            :show-start-player="multiplayerState.selectedPlayerIndex === gameState.impostorIndex"
            :show-game-info="multiplayerState.selectedPlayerIndex !== gameState.impostorIndex"
            :round="gameState.round"
            :category="gameState.category"
          />

          <!-- Action Buttons -->
          <div class="flex flex-wrap justify-center gap-4 mt-12">
            <button
              @click="resetMultiplayerSelection"
              class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-400"
            >
              🔄 Choose Different Player
            </button>
            <div class="flex gap-4 justify-center">
              <button
                @click="startNextRound"
                class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400"
              >
                ➡️ Next Round
              </button>
              <button
                @click="showModeSelection = true"
                class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-400"
              >
                🎮 New Game
              </button>
            </div>
          </div>

          <!-- Multiplayer Round Instructions -->
          <div class="mt-8 bg-blue-900/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4 max-w-2xl mx-auto">
            <p class="text-blue-200 text-sm text-center">
              💡 <strong>Multiplayer Tip:</strong> When ready for next round, everyone should tap "Next Round" on their device to get Round {{ gameState.round + 1 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Full-Screen Word Reveal Panel (Local Mode) -->
      <div v-if="gameState.activePlayer !== null" class="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-50 p-4">
        <div class="w-full max-w-4xl text-center">
          <!-- Privacy Screen Before Reveal -->
          <div v-if="!gameState.revealed" class="fade-in">
            <div class="mb-8">
              <h2 class="text-4xl md:text-6xl font-bold text-white mb-4">
                🎭 Player {{ gameState.activePlayer + 1 }}
              </h2>
              <p class="text-xl md:text-2xl text-gray-300 mb-8">
                Make sure only you can see the screen
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

          <!-- Role Reveal After Button Tap -->
          <div v-else class="fade-in">
            <RoleReveal
              :is-impostor="gameState.activePlayer === gameState.impostorIndex"
              :word="gameState.chosenWord"
              :start-player-index="gameState.startPlayerIndex"
            />

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
              <button
                @click="showModeSelection = true"
                class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-400"
              >
                🎮 New Game
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
import { ref, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { inject } from '@vercel/analytics'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import DeterministicMultiplayer from '@/components/DeterministicMultiplayer.vue'
import PlayerGrid from '@/components/game/PlayerGrid.vue'
import RoleReveal from '@/components/game/RoleReveal.vue'
import { useGameState } from '@/composables/useGameState'
import type { GameCodeData } from '@/lib/deterministicMultiplayer'

// Use composable for game state management
const {
  gameState,
  multiplayerState,
  hasMorePlayers,
  updateGameState,
  selectPlayer,
  revealWord,
  hideWord,
  nextPlayer,
  startNextRound,
  setGameMode,
  joinGame,
  startLocalGame,
  selectMultiplayerPlayerIdentity,
  resetMultiplayerSelection
} = useGameState()

// Local UI state
const showRules = useLocalStorage('impostor-game-show-rules', true)
const showModeSelection = ref(true)

// Event handlers
function handleModeSelection(mode: 'local' | 'multiplayer') {
  setGameMode(mode)
  showModeSelection.value = false
}

function handleJoinedGame(gameCode: string, isHost: boolean, gameSettings?: GameCodeData) {
  joinGame(gameCode, isHost, gameSettings)
  showModeSelection.value = false
}

function handleStartLocalGame(players: number, category: string) {
  startLocalGame(players, category)
  showModeSelection.value = false
}

// Initialize
onMounted(() => {
  updateGameState()
  inject() // Vercel Analytics
})
</script>
