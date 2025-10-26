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
    "Gen Z Vibes": ["rizz", "slay", "vibe check", "no cap", "bussin", "chef's kiss", "touch grass", "main character", "gaslight", "gatekeep", "girlboss", "delulu", "living rent free", "caught in 4K", "it's giving", "understood the assignment", "periodt", "and I oop", "stan", "simp", "mid", "ate and left no crumbs", "serving looks", "that's on period", "the way", "I'm screaming", "not me", "bestie", "purr", "sheesh", "respectfully", "unhinged", "chronically online", "hot girl walk", "roman empire", "beige flag", "red flag", "green flag", "situationship", "soft launch", "hard launch"],
    "Psychedelic Trip": ["fractal", "kaleidoscope", "cosmic dance", "third eye", "astral plane", "consciousness expansion", "sacred geometry", "rainbow serpent", "time dilation", "ego death", "divine light", "infinite loop", "cosmic giggle", "reality melt", "color symphony", "dimension hop", "spirit molecule", "entity contact", "mandala", "chakra", "frequency shift", "universal love", "energy waves", "crystalline structures", "sacred spiral", "quantum realm", "void meditation", "inner cosmos", "light beings", "unified field", "transcendence", "higher self", "cosmic consciousness", "archetypal vision", "eternal now", "interconnectedness", "vibration", "enlightenment", "oneness", "metamorphosis", "celestial journey", "mystic portal"],
    "Viral Internet": ["meme", "going viral", "TikTok trend", "algorithm", "for you page", "content creator", "influencer", "aesthetic", "core memory", "main character energy", "plot twist", "lore drop", "deep lore", "canon event", "NPC energy", "side quest", "speedrun", "glitch in the matrix", "parallel universe", "timeline", "multiverse", "simulation theory", "cursed image", "blessed image", "chaotic energy", "dark academia", "cottagecore", "goblincore", "weirdcore", "traumacore", "Y2K", "vaporwave", "indie sleaze", "clean girl", "that girl", "it girl", "mob wife", "blokecore", "dopamine menu", "girlhood", "boyhood", "adulting", "hyperpop", "bedroom pop"],
    "Fantasy Realms": ["dragon", "unicorn", "phoenix", "griffin", "basilisk", "chimera", "hydra", "pegasus", "centaur", "mermaid", "fairy", "elf", "dwarf", "goblin", "troll", "ogre", "orc", "wizard", "sorcerer", "witch", "warlock", "necromancer", "paladin", "ranger", "rogue", "bard", "druid", "monk", "enchanted forest", "crystal cave", "floating island", "ancient ruins", "mystic portal", "magic sword", "healing potion", "spell book", "wand", "staff", "amulet", "crown of thorns", "legendary armor", "quest", "prophecy", "chosen one", "dark lord", "sacred temple", "forbidden magic"],
    "Street Food": ["tacos al pastor", "banh mi", "falafel wrap", "churros", "empanadas", "samosas", "spring rolls", "gyros", "shawarma", "kebabs", "takoyaki", "okonomiyaki", "corn dog", "funnel cake", "beignets", "elote", "arepas", "pupusas", "pad thai", "pho", "ramen burger", "loaded fries", "nachos supreme", "quesadilla", "burritos", "dumplings", "bao buns", "fish and chips", "poutine", "hot chicken", "philly cheesesteak", "choripan", "anticuchos", "jerk chicken", "doubles", "roti", "gua bao", "crepes", "waffle sandwich", "bubble waffle", "mochi donuts", "cronut", "pretzel bites"],
    "Retro Gaming": ["power up", "game over", "insert coin", "high score", "extra life", "boss battle", "level up", "checkpoint", "save point", "health bar", "mana potion", "critical hit", "combo breaker", "fatality", "Easter egg", "cheat code", "speed run", "no clip", "pixel art", "8-bit music", "loading screen", "game cartridge", "memory card", "controller", "joystick", "arcade cabinet", "LAN party", "respawn", "rage quit", "GG", "noob", "pwned", "camping", "griefing", "loot drop", "rare item", "legendary weapon", "secret passage", "hidden room", "warp zone", "final boss", "credits roll", "new game plus"],
    "Space Odyssey": ["black hole", "supernova", "nebula", "quasar", "pulsar", "white dwarf", "red giant", "neutron star", "wormhole", "asteroid belt", "cosmic dust", "dark matter", "antimatter", "space station", "lunar base", "Mars colony", "terraforming", "cryosleep", "light speed", "hyperspace", "starship", "space suit", "solar panel", "satellite", "rocket launch", "zero gravity", "spacewalk", "alien life", "first contact", "galactic empire", "rebel alliance", "space pirates", "asteroid mining", "comet tail", "meteor shower", "eclipse", "constellation", "binary stars", "exoplanet", "habitable zone", "cosmic radiation", "time dilation"],
    "Urban Legends": ["Bigfoot", "Loch Ness Monster", "Mothman", "Chupacabra", "Jersey Devil", "Slenderman", "Bloody Mary", "vanishing hitchhiker", "black eyed kids", "skinwalker", "wendigo", "banshee", "poltergeist", "shadow people", "men in black", "Area 51", "Bermuda Triangle", "cursed object", "haunted doll", "ghost ship", "phantom train", "crying lady", "headless horseman", "hook man", "babysitter killer", "clown statue", "killer in backseat", "kidney heist", "alligators in sewers", "haunted mirror", "ouija board", "séance gone wrong", "possessed house", "cemetery at midnight", "full moon ritual", "creepy pasta", "SCP Foundation", "backrooms", "liminal space", "found footage", "analog horror", "cryptid sighting"],
    "Coffee Culture": ["espresso", "cappuccino", "latte", "macchiato", "americano", "flat white", "cortado", "affogato", "cold brew", "nitro coffee", "pour over", "French press", "AeroPress", "siphon brew", "Turkish coffee", "Vietnamese coffee", "Irish coffee", "mocha", "frappe", "iced latte", "oat milk", "almond milk", "caramel drizzle", "vanilla syrup", "hazelnut flavor", "pumpkin spice", "lavender latte", "matcha latte", "chai tea latte", "golden milk", "turmeric latte", "beetroot latte", "butterfly pea", "coffee art", "latte art", "heart design", "rosetta", "tulip", "swan", "barista", "coffee beans", "single origin", "light roast", "dark roast", "medium roast", "blonde roast", "espresso shot", "double shot", "ristretto"],
    "Extreme Sports": ["base jumping", "wingsuit flying", "parkour", "free running", "bungee jumping", "skydiving", "hang gliding", "paragliding", "cliff diving", "big wave surfing", "kitesurfing", "wakeboarding", "freestyle motocross", "BMX", "mountain biking", "downhill racing", "rock climbing", "ice climbing", "free solo", "highlining", "slacklining", "snowboarding", "heli-skiing", "speed skiing", "ski jumping", "freestyle skiing", "skateboarding", "vert ramp", "half pipe", "mega ramp", "rally racing", "drifting", "street racing", "formula one", "supercross", "enduro racing", "whitewater rafting", "kayaking", "canyoning", "cave diving", "shark cage diving", "volcano boarding", "sandboarding"],
    "Mystical Artifacts": ["crystal ball", "tarot cards", "rune stones", "pendulum", "dreamcatcher", "medicine bag", "singing bowl", "prayer beads", "incense burner", "smudge stick", "cauldron", "grimoire", "athame", "chalice", "pentacle", "wand", "scrying mirror", "oracle deck", "spirit board", "worry stone", "healing crystal", "amethyst geode", "rose quartz", "obsidian blade", "moonstone", "selenite tower", "palo santo", "sage bundle", "divination tools", "astrology chart", "birth chart", "manifestation journal", "spell candle", "altar cloth", "offering bowl", "feather wand", "bone dice", "tribal mask", "totem pole", "shaman drum", "rain stick", "medicine wheel", "spirit animal card"],
    "Dystopian Future": ["surveillance state", "mega corporation", "cyberpunk city", "neon lights", "hologram ads", "neural implant", "augmented reality", "virtual prison", "AI overlord", "robot uprising", "clone army", "genetic modification", "designer babies", "memory erasure", "thought police", "social credit score", "propaganda broadcast", "underground resistance", "black market tech", "banned literature", "synthetic food", "water rations", "oxygen tax", "climate refugee", "walled city", "wasteland", "radiation zone", "mutant creatures", "synthetic humans", "consciousness upload", "digital immortality", "corporate warfare", "drone swarm", "EMP blast", "bunker society", "post-apocalypse", "resource wars", "techno-feudalism", "digital currency", "biometric tracking", "facial recognition", "predictive policing"],
    "Comfort Things": ["weighted blanket", "fuzzy socks", "hot chocolate", "cozy fireplace", "rainy day", "soft pillow", "warm hoodie", "comfort food", "bubble bath", "scented candles", "fairy lights", "plush toy", "movie marathon", "binge watching", "pajama day", "sleeping in", "afternoon nap", "comfort show", "childhood snack", "mac and cheese", "grilled cheese", "tomato soup", "chicken noodle soup", "fresh cookies", "warm bread", "morning coffee", "tea time", "book nook", "reading corner", "bean bag chair", "hammock", "swing", "rocking chair", "thick blanket", "fleece throw", "heating pad", "slippers", "robe", "oversized sweater", "comfort playlist", "lo-fi beats", "ASMR"],
    "Ocean Mysteries": ["deep sea trench", "bioluminescence", "giant squid", "anglerfish", "jellyfish bloom", "coral reef", "kelp forest", "underwater cave", "shipwreck", "sunken treasure", "submarine volcano", "hydrothermal vent", "abyssal plain", "midnight zone", "pressure suit", "diving bell", "oceanic trench", "sea monster", "kraken", "megalodon", "giant octopus", "sea serpent", "ghost ship", "phantom island", "lost city of Atlantis", "underwater ruins", "marine archaeology", "deep sea creature", "whale song", "dolphin pod", "shark feeding frenzy", "manta ray", "sea turtle migration", "plankton bloom", "red tide", "dead zone", "plastic island", "ocean current", "tidal wave", "rogue wave", "whirlpool", "maelstrom", "ocean floor mapping", "sonar ping", "submarine", "bathysphere"],
    "Cozy Aesthetics": ["cottagecore", "grandmacore", "dark academia", "light academia", "forest cottage", "mushroom picking", "wildflower bouquet", "vintage teacup", "handwritten letter", "wax seal", "fountain pen", "leather journal", "bookshelf", "library ladder", "reading nook", "window seat", "potted plants", "herb garden", "homemade bread", "jam making", "knitting", "crochet", "embroidery", "quilting", "pressed flowers", "dried herbs", "mason jars", "vintage dishes", "lace curtains", "wooden furniture", "antique mirror", "oil lamp", "candlestick", "typewriter", "vinyl records", "film camera", "polaroid", "scrapbook", "memory box", "hope chest", "rocking chair", "porch swing", "garden path"]
  }
  
  const words = WORD_BANK[category] || WORD_BANK["Gen Z Vibes"]
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
  
  // Encode category
  const categoryMap: Record<string, string> = {
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
    'Cozy Aesthetics': 'A'
  }
  
  const categoryCode = categoryMap[category] || 'G'
  
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
      'A': 'Cozy Aesthetics'
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