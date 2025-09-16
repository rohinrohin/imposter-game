import { seededRandFromKey, numberFromRng, pickDeterministic, createGameState, type GameState } from './gameLogic'

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
  // Create a unique seed from game code + config
  const configSeed = `${config.gameCode}-${config.players}-${config.round}-${config.category}`
  
  // Generate the base game state deterministically
  const baseGameState = createGameState(config.players, config.round, config.category)
  
  // Override with deterministic values based on game code
  const gameCodeRng = seededRandFromKey(config.gameCode)
  
  // Deterministic impostor selection based on game code + player names
  const playerSeed = `${config.gameCode}-players-${config.playerNames.sort().join('-')}`
  const impostorRng = seededRandFromKey(playerSeed)
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
export function isPlayerImpostor(gameCode: string, playerName: string, allPlayerNames: string[]): boolean {
  const sortedNames = [...allPlayerNames].sort()
  const playerIndex = sortedNames.indexOf(playerName)
  
  if (playerIndex === -1) return false
  
  const playerSeed = `${gameCode}-players-${sortedNames.join('-')}`
  const impostorRng = seededRandFromKey(playerSeed)
  const impostorIndex = numberFromRng(impostorRng, sortedNames.length)
  
  return playerIndex === impostorIndex
}

/**
 * Get the secret word for a specific game configuration
 */
export function getDeterministicWord(gameCode: string, category: string, round: number): string {
  // Import WORD_BANK here to avoid circular dependency
  const WORD_BANK: Record<string, string[]> = {
    Everyday: ["coffee", "umbrella", "backpack", "toothbrush", "wallet", "headphones", "keys", "sunglasses", "notebook", "water bottle", "pillow", "towel", "soap", "mirror", "clock", "candle", "scissors", "tape", "stapler", "pen", "pencil", "eraser", "ruler", "calculator", "calendar", "diary", "flashlight", "batteries", "charger", "remote control"],
    Food: ["pizza", "sushi", "burrito", "lasagna", "pancakes", "curry", "sandwich", "salad", "soup", "pasta", "hamburger", "hot dog", "taco", "noodles", "rice", "bread", "cheese", "chocolate", "ice cream", "cake", "cookies", "pie", "donut", "bagel", "cereal", "yogurt", "banana", "apple", "orange", "strawberry", "grapes", "watermelon", "avocado", "tomato", "carrot"],
    Places: ["library", "airport", "zoo", "museum", "beach", "mountain", "park", "restaurant", "cinema", "hospital", "school", "office", "mall", "gym", "hotel", "bank", "post office", "gas station", "pharmacy", "bakery", "cafe", "theater", "stadium", "playground", "garden", "farm", "forest", "desert", "island", "bridge", "tunnel", "castle", "church", "temple", "lighthouse"],
    Animals: ["elephant", "penguin", "butterfly", "dolphin", "tiger", "rabbit", "eagle", "frog", "horse", "cat", "dog", "lion", "giraffe", "zebra", "monkey", "bear", "wolf", "fox", "deer", "owl", "parrot", "snake", "turtle", "shark", "whale", "octopus", "crab", "lobster", "bee", "ant", "spider", "ladybug", "dragonfly", "mouse", "hamster", "guinea pig", "goldfish", "chicken"],
    Sports: ["basketball", "swimming", "tennis", "soccer", "golf", "volleyball", "cycling", "running", "boxing", "skiing", "baseball", "football", "hockey", "badminton", "ping pong", "wrestling", "gymnastics", "archery", "bowling", "surfing", "skateboarding", "snowboarding", "climbing", "hiking", "fishing", "sailing", "rowing", "diving", "karate", "judo", "yoga", "dancing"],
    Technology: ["smartphone", "laptop", "headphones", "camera", "robot", "drone", "tablet", "keyboard", "mouse", "monitor", "printer", "scanner", "router", "modem", "speaker", "microphone", "television", "radio", "GPS", "smartwatch", "earbuds", "charger", "battery", "USB drive", "hard drive", "webcam", "projector", "calculator", "computer", "server", "satellite", "radar"],
    Transportation: ["car", "bus", "train", "airplane", "helicopter", "boat", "ship", "bicycle", "motorcycle", "truck", "taxi", "subway", "tram", "ferry", "yacht", "canoe", "kayak", "skateboard", "scooter", "rocket", "ambulance", "fire truck", "police car", "limousine", "van", "pickup truck", "trailer", "jet", "glider", "balloon"],
    Professions: ["doctor", "teacher", "chef", "pilot", "firefighter", "police officer", "nurse", "engineer", "lawyer", "artist", "musician", "writer", "actor", "dancer", "photographer", "journalist", "scientist", "programmer", "architect", "designer", "mechanic", "plumber", "electrician", "carpenter", "farmer", "veterinarian", "dentist", "librarian", "cashier", "waiter"],
    Clothing: ["shirt", "pants", "dress", "skirt", "jacket", "coat", "sweater", "hoodie", "jeans", "shorts", "socks", "shoes", "boots", "sneakers", "sandals", "hat", "cap", "scarf", "gloves", "belt", "tie", "suit", "uniform", "pajamas", "underwear", "bra", "swimsuit", "raincoat", "vest", "apron"],
    Weather: ["sunny", "cloudy", "rainy", "snowy", "windy", "stormy", "foggy", "humid", "dry", "hot", "cold", "warm", "cool", "freezing", "scorching", "drizzle", "downpour", "blizzard", "tornado", "hurricane", "lightning", "thunder", "hail", "frost", "rainbow", "mist", "breeze", "gale", "monsoon", "drought"],
    Music: ["piano", "guitar", "violin", "drums", "trumpet", "saxophone", "flute", "clarinet", "harp", "cello", "bass", "keyboard", "microphone", "speaker", "headphones", "concert", "song", "melody", "rhythm", "beat", "harmony", "chord", "note", "scale", "tempo", "volume", "orchestra", "band", "choir", "album"],
    Emotions: ["happy", "sad", "angry", "excited", "nervous", "calm", "surprised", "confused", "proud", "embarrassed", "jealous", "grateful", "worried", "relaxed", "frustrated", "content", "anxious", "cheerful", "disappointed", "hopeful", "scared", "brave", "shy", "confident", "curious", "bored", "amazed", "disgusted", "lonely", "loved"],
    Colors: ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "black", "white", "gray", "silver", "gold", "turquoise", "navy", "maroon", "lime", "olive", "teal", "aqua", "fuchsia", "coral", "salmon", "beige", "tan", "cream", "ivory", "indigo", "violet", "magenta"],
    School: ["classroom", "teacher", "student", "homework", "test", "exam", "grade", "book", "pencil", "eraser", "ruler", "calculator", "backpack", "lunch", "recess", "playground", "library", "computer", "projector", "whiteboard", "desk", "chair", "locker", "hallway", "principal", "nurse", "janitor", "bus", "uniform", "diploma"],
    Movies: ["action", "comedy", "drama", "horror", "romance", "thriller", "adventure", "fantasy", "science fiction", "documentary", "animation", "musical", "western", "mystery", "crime", "superhero", "war", "historical", "biographical", "family", "teen", "indie", "foreign", "classic", "sequel", "trilogy", "franchise", "blockbuster", "award winner", "cult classic"]
  }
  
  const words = WORD_BANK[category] || WORD_BANK.Everyday
  const wordSeed = `${gameCode}-word-${category}-${round}`
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
  
  // Encode category (first letter + length)
  const categoryMap: Record<string, string> = {
    'Everyday': 'E',
    'Food': 'F', 
    'Places': 'P',
    'Animals': 'A',
    'Sports': 'S',
    'Technology': 'T',
    'Transportation': 'R',
    'Professions': 'O',
    'Clothing': 'C',
    'Weather': 'W',
    'Music': 'M',
    'Emotions': 'N',
    'Colors': 'L',
    'School': 'H',
    'Movies': 'V'
  }
  
  const categoryCode = categoryMap[category] || 'E'
  
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
    
    // Decode category
    const categoryMap: Record<string, string> = {
      'E': 'Everyday',
      'F': 'Food',
      'P': 'Places', 
      'A': 'Animals',
      'S': 'Sports',
      'T': 'Technology',
      'R': 'Transportation',
      'O': 'Professions',
      'C': 'Clothing',
      'W': 'Weather',
      'M': 'Music',
      'N': 'Emotions',
      'L': 'Colors',
      'H': 'School',
      'V': 'Movies'
    }
    
    const category = categoryMap[categoryCode]
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