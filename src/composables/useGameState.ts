import { ref, computed } from 'vue'
import { createGameState, seededRandFromKey, numberFromRng, ALL_CATEGORIES, type GameState } from '@/lib/gameLogic'
import {
  generateDeterministicGame,
  getDeterministicWord,
  type DeterministicGameConfig,
  type GameCodeData
} from '@/lib/deterministicMultiplayer'

export type GameMode = 'local' | 'multiplayer'

export interface MultiplayerState {
  gameCode: string | null
  isHost: boolean
  gameMode: GameMode
  selectedPlayerIndex: number | null
}

export function useGameState() {
  // Reactive state
  const gameState = ref<GameState>(createGameState(5, 1, ALL_CATEGORIES[0]))
  const multiplayerState = ref<MultiplayerState>({
    gameCode: null,
    isHost: false,
    gameMode: 'local',
    selectedPlayerIndex: null
  })

  // Computed properties
  const hasMorePlayers = computed(() => {
    if (gameState.value.activePlayer === null) return false
    return gameState.value.activePlayer < gameState.value.players - 1
  })

  const isMultiplayer = computed(() => multiplayerState.value.gameMode === 'multiplayer')

  // Core game state methods
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

  function updateDeterministicGameState() {
    if (isMultiplayer.value) {
      generateDeterministicGameFromCode()
    } else {
      updateGameState()
    }
  }

  function startGame() {
    gameState.value.gameStarted = true
    gameState.value.activePlayer = null
    gameState.value.revealed = false
  }

  function selectPlayer(playerIndex: number) {
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

  function startNextRound() {
    // Increment round for new word/impostor
    gameState.value.round += 1

    // Reset UI state
    gameState.value.activePlayer = null
    gameState.value.revealed = false
    multiplayerState.value.selectedPlayerIndex = null

    // Regenerate game state with new round (deterministic for all players with same code)
    updateDeterministicGameState()
  }

  // Multiplayer methods
  function setGameMode(mode: GameMode) {
    multiplayerState.value.gameMode = mode
  }

  function joinGame(gameCode: string, isHost: boolean, gameSettings?: GameCodeData) {
    multiplayerState.value.gameCode = gameCode
    multiplayerState.value.isHost = isHost
    multiplayerState.value.gameMode = 'multiplayer'

    // If joining with smart game code, apply the settings automatically
    if (gameSettings) {
      gameState.value.players = gameSettings.players
      gameState.value.category = gameSettings.category
      gameState.value.round = gameSettings.round
    }

    // Generate deterministic game state from game code and start immediately
    generateDeterministicGameFromCode()
    startGame()
  }

  function startLocalGame(players: number, category: string) {
    multiplayerState.value.gameMode = 'local'

    // Apply the settings from the unified UI
    gameState.value.players = players
    gameState.value.category = category
    gameState.value.round = 1

    // Generate local game state and start immediately
    updateGameState()
    startGame()
  }

  function selectMultiplayerPlayerIdentity(playerIndex: number) {
    multiplayerState.value.selectedPlayerIndex = playerIndex
  }

  function resetMultiplayerSelection() {
    multiplayerState.value.selectedPlayerIndex = null
  }

  function resetGame() {
    multiplayerState.value = {
      gameCode: null,
      isHost: false,
      gameMode: 'local',
      selectedPlayerIndex: null
    }
    gameState.value = createGameState(5, 1, ALL_CATEGORIES[0])
  }

  return {
    // State
    gameState,
    multiplayerState,

    // Computed
    hasMorePlayers,
    isMultiplayer,

    // Methods
    updateGameState,
    updateDeterministicGameState,
    startGame,
    selectPlayer,
    revealWord,
    hideWord,
    nextPlayer,
    startNextRound,
    setGameMode,
    joinGame,
    startLocalGame,
    selectMultiplayerPlayerIdentity,
    resetMultiplayerSelection,
    resetGame
  }
}
