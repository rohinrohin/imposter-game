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
  // Generate the base game state deterministically
  const baseGameState = createGameState(config.players, config.round, config.category)
  
  // Deterministic impostor selection based on game code + round number
  const impostorSeed = `${config.gameCode}-impostor-${config.round}`
  const impostorRng = seededRandFromKey(impostorSeed)
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
export function isPlayerImpostor(gameCode: string, playerName: string, allPlayerNames: string[], round: number): boolean {
  const sortedNames = [...allPlayerNames].sort()
  const playerIndex = sortedNames.indexOf(playerName)
  
  if (playerIndex === -1) return false
  
  const impostorSeed = `${gameCode}-impostor-${round}`
  const impostorRng = seededRandFromKey(impostorSeed)
  const impostorIndex = numberFromRng(impostorRng, sortedNames.length)
  
  return playerIndex === impostorIndex
}

/**
 * Get the secret word for a specific game configuration
 */
export function getDeterministicWord(gameCode: string, category: string, round: number): string {
  // Import WORD_BANK here to avoid circular dependency
  const WORD_BANK: Record<string, string[]> = {
    "Gen Z Vibes": ["rizz", "slay", "bussin", "delulu", "stan", "simp", "mid", "bestie", "purr", "sheesh", "unhinged", "gaslight", "gatekeep", "girlboss", "periodt", "respectfully", "situationship", "aesthetic", "vibe", "cringe", "basic", "salty", "shook", "sus", "tea", "flex", "clout", "fire", "lowkey", "highkey", "ghosting", "finsta", "FOMO", "GOAT", "lit", "savage", "shade", "thirsty", "woke", "yeet", "cap"],
    "Psychedelic Trip": ["fractal", "kaleidoscope", "mandala", "chakra", "vibration", "enlightenment", "oneness", "transcendence", "portal", "spiral", "infinity", "cosmos", "dimension", "frequency", "energy", "aura", "crystal", "prism", "vortex", "nebula", "galaxy", "stardust", "moonbeam", "sunburst", "rainbow", "aurora", "mirage", "illusion", "vision", "dreamscape", "trance", "meditation", "nirvana", "bliss", "harmony", "unity", "consciousness", "awakening", "metamorphosis", "rebirth", "euphoria", "serenity"],
    "Viral Internet": ["meme", "viral", "trending", "algorithm", "influencer", "aesthetic", "timeline", "multiverse", "speedrun", "cursed", "blessed", "chaotic", "cottagecore", "goblincore", "weirdcore", "traumacore", "vaporwave", "hyperpop", "girlhood", "boyhood", "adulting", "NPC", "main character", "side quest", "lore", "canon", "cringe", "based", "ratio", "stan", "simp", "touch grass", "chronically online", "unhinged", "feral", "goblin mode", "delulu", "rizz", "aura", "edgy", "softcore", "hardcore"],
    "Fantasy Realms": ["dragon", "unicorn", "phoenix", "griffin", "basilisk", "chimera", "hydra", "pegasus", "centaur", "mermaid", "fairy", "elf", "dwarf", "goblin", "troll", "ogre", "orc", "wizard", "sorcerer", "witch", "warlock", "necromancer", "paladin", "ranger", "rogue", "bard", "druid", "monk", "wand", "staff", "amulet", "sword", "shield", "armor", "potion", "spell", "quest", "prophecy", "crystal", "dungeon", "castle"],
    "Street Food": ["tacos", "churros", "empanadas", "samosas", "gyros", "shawarma", "kebabs", "takoyaki", "okonomiyaki", "elote", "arepas", "pupusas", "pho", "dumplings", "poutine", "roti", "crepes", "beignets", "falafel", "quesadilla", "burritos", "nachos", "pretzel", "corndog", "funnel cake", "waffle", "cronut", "donut", "bagel", "mochi", "bao", "tamale", "chimichanga", "tostada", "flautas", "gordita", "sope", "esquite", "chicharron", "churro", "bunuelo"],
    "Retro Gaming": ["powerup", "checkpoint", "respawn", "fatality", "combo", "joystick", "controller", "cartridge", "pixel", "sprite", "noob", "pwned", "camping", "griefing", "loot", "boss", "health bar", "mana", "continue", "game over", "insert coin", "arcade", "highscore", "cheatcode", "speedrun", "glitch", "mod", "emulator", "ROM", "console", "platform", "sidescroller", "dungeon", "quest", "inventory", "save", "load", "pause", "warp", "secret", "bonus"],
    "Space Odyssey": ["nebula", "quasar", "pulsar", "supernova", "wormhole", "asteroid", "comet", "meteor", "satellite", "starship", "rocket", "galaxy", "cosmos", "void", "orbit", "launch", "spacewalk", "alien", "exoplanet", "eclipse", "constellation", "antimatter", "hyperspace", "cryosleep", "terraforming", "moonbase", "colony", "spacecraft", "shuttle", "probe", "aurora", "solar", "lunar", "stellar", "cosmic", "astral", "celestial", "interstellar", "zero gravity", "stardust", "blackhole"],
    "Urban Legends": ["Bigfoot", "Mothman", "Chupacabra", "Slenderman", "wendigo", "banshee", "poltergeist", "skinwalker", "cryptid", "phantom", "specter", "apparition", "haunting", "possession", "curse", "hex", "omen", "ritual", "séance", "ouija", "cemetery", "graveyard", "tombstone", "crypt", "mausoleum", "coffin", "ghost", "spirit", "shadow", "entity", "demon", "vampire", "werewolf", "zombie", "ghoul", "monster", "creature", "beast", "legend", "myth", "folklore"],
    "Coffee Culture": ["espresso", "cappuccino", "latte", "macchiato", "americano", "mocha", "frappe", "cortado", "affogato", "ristretto", "barista", "brew", "roast", "beans", "grind", "steam", "foam", "crema", "drip", "pour", "French press", "AeroPress", "siphon", "Turkish", "Vietnamese", "Irish", "iced", "cold brew", "nitro", "oat milk", "almond milk", "soy milk", "vanilla", "caramel", "hazelnut", "cinnamon", "chocolate", "whipped cream", "sprinkles", "syrup", "sugar"],
    "Extreme Sports": ["parkour", "skydiving", "snowboarding", "skateboarding", "surfing", "wakeboarding", "BMX", "motocross", "kayaking", "rafting", "climbing", "bungee", "wingsuit", "paragliding", "kitesurfing", "slacklining", "highlining", "drifting", "rally", "downhill", "freeride", "halfpipe", "ramp", "grind", "ollie", "kickflip", "backflip", "frontflip", "aerial", "trick", "stunt", "jump", "drop", "carve", "shred", "gnarly", "radical", "tube", "barrel", "wave", "powder"],
    "Mystical Artifacts": ["crystal", "tarot", "runes", "pendulum", "dreamcatcher", "cauldron", "grimoire", "athame", "chalice", "pentacle", "wand", "orb", "amulet", "talisman", "charm", "scroll", "tome", "spell", "potion", "elixir", "incense", "sage", "smudge", "candle", "altar", "offering", "ritual", "divination", "scrying", "mirror", "geode", "quartz", "amethyst", "obsidian", "moonstone", "selenite", "jade", "turquoise", "opal", "ruby"],
    "Dystopian Future": ["cyberpunk", "neon", "hologram", "implant", "cyborg", "android", "robot", "drone", "AI", "algorithm", "surveillance", "corporation", "wasteland", "bunker", "vault", "radiation", "mutant", "clone", "synthetic", "virtual", "matrix", "grid", "network", "firewall", "hack", "virus", "malware", "glitch", "crash", "reboot", "upgrade", "augment", "biometric", "scanner", "chip", "code", "data", "upload", "download", "server"],
    "Comfort Things": ["blanket", "pillow", "hoodie", "slippers", "robe", "candle", "tea", "coffee", "chocolate", "cookies", "soup", "fireplace", "hammock", "swing", "nap", "cuddle", "snuggle", "cozy", "warm", "soft", "fuzzy", "plush", "teddy", "book", "movie", "music", "rain", "snow", "autumn", "sweater", "scarf", "mittens", "socks", "pajamas", "bath", "bubble", "aromatherapy", "lavender", "vanilla", "cinnamon", "nostalgia"],
    "Ocean Mysteries": ["kraken", "megalodon", "leviathan", "serpent", "mermaid", "siren", "shipwreck", "treasure", "atlantis", "abyss", "trench", "reef", "kelp", "jellyfish", "squid", "octopus", "anglerfish", "shark", "whale", "dolphin", "narwhal", "seahorse", "starfish", "coral", "pearl", "shell", "tsunami", "whirlpool", "maelstrom", "tide", "current", "wave", "depth", "submarine", "anchor", "lighthouse", "buoy", "sailor", "pirate", "mariner"],
    "Cozy Aesthetics": ["cottagecore", "grandmacore", "bookshelf", "teacup", "vintage", "antique", "rustic", "farmhouse", "cottage", "cabin", "hearth", "quilt", "knitting", "crochet", "embroidery", "lace", "floral", "botanical", "garden", "greenhouse", "windowsill", "plants", "herbs", "wildflower", "daisy", "rose", "lavender", "honeysuckle", "mushroom", "moss", "fern", "basket", "wicker", "pottery", "ceramic", "handmade", "homemade", "baking", "bread", "jam", "honey"],
    "Indian": ["Bollywood", "chai", "dosa", "biryani", "samosa", "naan", "paneer", "curry", "tandoor", "masala", "tikka", "kebab", "lassi", "gulab jamun", "jalebi", "kulfi", "diwali", "holi", "rangoli", "mehndi", "saree", "kurta", "dhoti", "bindi", "tabla", "sitar", "harmonium", "dhol", "bhangra", "kathak", "namaste", "yoga", "mandir", "taj mahal", "rickshaw", "bazaar", "monsoon", "cricket", "maharaja", "rajput", "hindi", "punjabi", "bengali", "tamil"]
  }
  
  const ALL_CATEGORIES = Object.keys(WORD_BANK)

  // Handle "Random" category by picking a random category deterministically
  let actualCategory = category
  let words = WORD_BANK[category]

  if (category === 'Random') {
    const categorySeed = `${gameCode}-cat-${round}`
    const categoryRng = seededRandFromKey(categorySeed)
    actualCategory = pickDeterministic(categoryRng, ALL_CATEGORIES)
    words = WORD_BANK[actualCategory]
  }

  if (!words) {
    words = WORD_BANK["Gen Z Vibes"]
  }

  const wordSeed = `${gameCode}-word-${actualCategory}-${round}`
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
  
  // Encode category
  const categoryMap: Record<string, string> = {
    'Random': 'Z',
    'Gen Z Vibes': 'G',
    'Psychedelic Trip': 'P',
    'Viral Internet': 'V',
    'Fantasy Realms': 'F',
    'Street Food': 'S',
    'Retro Gaming': 'R',
    'Space Odyssey': 'O',
    'Urban Legends': 'U',
    'Coffee Culture': 'C',
    'Extreme Sports': 'E',
    'Mystical Artifacts': 'M',
    'Dystopian Future': 'D',
    'Comfort Things': 'T',
    'Ocean Mysteries': 'N',
    'Cozy Aesthetics': 'A',
    'Indian': 'I'
  }

  const categoryCode = categoryMap[category] || 'Z'
  
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
      'Z': 'Random',
      'G': 'Gen Z Vibes',
      'P': 'Psychedelic Trip',
      'V': 'Viral Internet',
      'F': 'Fantasy Realms',
      'S': 'Street Food',
      'R': 'Retro Gaming',
      'O': 'Space Odyssey',
      'U': 'Urban Legends',
      'C': 'Coffee Culture',
      'E': 'Extreme Sports',
      'M': 'Mystical Artifacts',
      'D': 'Dystopian Future',
      'T': 'Comfort Things',
      'N': 'Ocean Mysteries',
      'A': 'Cozy Aesthetics',
      'I': 'Indian'
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