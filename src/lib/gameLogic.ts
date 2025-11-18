import { WORD_BANK, ALL_CATEGORIES } from './constants'

// Re-export for backward compatibility
export { WORD_BANK, ALL_CATEGORIES }

// Seeded RNG helpers
function cyrb128(str: string): number[] {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0]
}

function mulberry32(a: number) {
  return function() {
    let t = (a += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededRandFromKey(key: string) {
  const [seed] = cyrb128(key)
  return mulberry32(seed)
}

export function numberFromRng(rng: () => number, max: number): number {
  return Math.floor(rng() * max) % max
}

export function pickDeterministic<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length) % arr.length]
}

export interface GameState {
  players: number
  round: number
  category: string
  activePlayer: number | null
  revealed: boolean
  impostorIndex: number
  chosenWord: string
  startPlayerIndex: number
  gameStarted: boolean
}

export function createGameState(players: number, round: number, category: string): GameState {
  const roomKey = `${round}#${players}#${category}`

  // Handle "Random" category by picking a random category deterministically
  let actualCategory = category
  let words = WORD_BANK[category]

  if (category === 'Random') {
    const categoryRng = seededRandFromKey(roomKey + ':cat')
    actualCategory = pickDeterministic(categoryRng, ALL_CATEGORIES)
    words = WORD_BANK[actualCategory]
  }

  const impostorIndex = numberFromRng(seededRandFromKey(roomKey + ':imp'), players)
  const chosenWord = pickDeterministic(seededRandFromKey(roomKey + ':word'), words)
  const startPlayerIndex = numberFromRng(seededRandFromKey(roomKey + ':start'), players)

  return {
    players,
    round,
    category: actualCategory, // Store the actual category that was selected
    activePlayer: null,
    revealed: false,
    impostorIndex,
    chosenWord,
    startPlayerIndex,
    gameStarted: false
  }
}