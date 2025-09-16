// ---- Expanded word bank ----
export const WORD_BANK: Record<string, string[]> = {
  Everyday: [
    "coffee", "umbrella", "backpack", "toothbrush", "wallet", "headphones", "keys", "sunglasses", 
    "notebook", "water bottle", "pillow", "towel", "soap", "mirror", "clock", "candle", "scissors", 
    "tape", "stapler", "pen", "pencil", "eraser", "ruler", "calculator", "calendar", "diary", 
    "flashlight", "batteries", "charger", "remote control"
  ],
  Food: [
    "pizza", "sushi", "burrito", "lasagna", "pancakes", "curry", "sandwich", "salad", "soup", 
    "pasta", "hamburger", "hot dog", "taco", "noodles", "rice", "bread", "cheese", "chocolate", 
    "ice cream", "cake", "cookies", "pie", "donut", "bagel", "cereal", "yogurt", "banana", 
    "apple", "orange", "strawberry", "grapes", "watermelon", "avocado", "tomato", "carrot"
  ],
  Places: [
    "library", "airport", "zoo", "museum", "beach", "mountain", "park", "restaurant", "cinema", 
    "hospital", "school", "office", "mall", "gym", "hotel", "bank", "post office", "gas station", 
    "pharmacy", "bakery", "cafe", "theater", "stadium", "playground", "garden", "farm", "forest", 
    "desert", "island", "bridge", "tunnel", "castle", "church", "temple", "lighthouse"
  ],
  Animals: [
    "elephant", "penguin", "butterfly", "dolphin", "tiger", "rabbit", "eagle", "frog", "horse", 
    "cat", "dog", "lion", "giraffe", "zebra", "monkey", "bear", "wolf", "fox", "deer", "owl", 
    "parrot", "snake", "turtle", "shark", "whale", "octopus", "crab", "lobster", "bee", "ant", 
    "spider", "ladybug", "dragonfly", "mouse", "hamster", "guinea pig", "goldfish", "chicken"
  ],
  Sports: [
    "basketball", "swimming", "tennis", "soccer", "golf", "volleyball", "cycling", "running", 
    "boxing", "skiing", "baseball", "football", "hockey", "badminton", "ping pong", "wrestling", 
    "gymnastics", "archery", "bowling", "surfing", "skateboarding", "snowboarding", "climbing", 
    "hiking", "fishing", "sailing", "rowing", "diving", "karate", "judo", "yoga", "dancing"
  ],
  Technology: [
    "smartphone", "laptop", "headphones", "camera", "robot", "drone", "tablet", "keyboard", 
    "mouse", "monitor", "printer", "scanner", "router", "modem", "speaker", "microphone", 
    "television", "radio", "GPS", "smartwatch", "earbuds", "charger", "battery", "USB drive", 
    "hard drive", "webcam", "projector", "calculator", "computer", "server", "satellite", "radar"
  ],
  Transportation: [
    "car", "bus", "train", "airplane", "helicopter", "boat", "ship", "bicycle", "motorcycle", 
    "truck", "taxi", "subway", "tram", "ferry", "yacht", "canoe", "kayak", "skateboard", 
    "scooter", "rocket", "ambulance", "fire truck", "police car", "limousine", "van", 
    "pickup truck", "trailer", "jet", "glider", "balloon"
  ],
  Professions: [
    "doctor", "teacher", "chef", "pilot", "firefighter", "police officer", "nurse", "engineer", 
    "lawyer", "artist", "musician", "writer", "actor", "dancer", "photographer", "journalist", 
    "scientist", "programmer", "architect", "designer", "mechanic", "plumber", "electrician", 
    "carpenter", "farmer", "veterinarian", "dentist", "librarian", "cashier", "waiter"
  ],
  Clothing: [
    "shirt", "pants", "dress", "skirt", "jacket", "coat", "sweater", "hoodie", "jeans", "shorts", 
    "socks", "shoes", "boots", "sneakers", "sandals", "hat", "cap", "scarf", "gloves", "belt", 
    "tie", "suit", "uniform", "pajamas", "underwear", "bra", "swimsuit", "raincoat", "vest", "apron"
  ],
  Weather: [
    "sunny", "cloudy", "rainy", "snowy", "windy", "stormy", "foggy", "humid", "dry", "hot", 
    "cold", "warm", "cool", "freezing", "scorching", "drizzle", "downpour", "blizzard", 
    "tornado", "hurricane", "lightning", "thunder", "hail", "frost", "rainbow", "mist", 
    "breeze", "gale", "monsoon", "drought"
  ],
  Music: [
    "piano", "guitar", "violin", "drums", "trumpet", "saxophone", "flute", "clarinet", "harp", 
    "cello", "bass", "keyboard", "microphone", "speaker", "headphones", "concert", "song", 
    "melody", "rhythm", "beat", "harmony", "chord", "note", "scale", "tempo", "volume", 
    "orchestra", "band", "choir", "album"
  ],
  Emotions: [
    "happy", "sad", "angry", "excited", "nervous", "calm", "surprised", "confused", "proud", 
    "embarrassed", "jealous", "grateful", "worried", "relaxed", "frustrated", "content", 
    "anxious", "cheerful", "disappointed", "hopeful", "scared", "brave", "shy", "confident", 
    "curious", "bored", "amazed", "disgusted", "lonely", "loved"
  ],
  Colors: [
    "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "black", "white", 
    "gray", "silver", "gold", "turquoise", "navy", "maroon", "lime", "olive", "teal", "aqua", 
    "fuchsia", "coral", "salmon", "beige", "tan", "cream", "ivory", "indigo", "violet", "magenta"
  ],
  School: [
    "classroom", "teacher", "student", "homework", "test", "exam", "grade", "book", "pencil", 
    "eraser", "ruler", "calculator", "backpack", "lunch", "recess", "playground", "library", 
    "computer", "projector", "whiteboard", "desk", "chair", "locker", "hallway", "principal", 
    "nurse", "janitor", "bus", "uniform", "diploma"
  ],
  Movies: [
    "action", "comedy", "drama", "horror", "romance", "thriller", "adventure", "fantasy", 
    "science fiction", "documentary", "animation", "musical", "western", "mystery", "crime", 
    "superhero", "war", "historical", "biographical", "family", "teen", "indie", "foreign", 
    "classic", "sequel", "trilogy", "franchise", "blockbuster", "award winner", "cult classic"
  ]
}

export const ALL_CATEGORIES = Object.keys(WORD_BANK)

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
  const words = WORD_BANK[category]
  
  const impostorIndex = numberFromRng(seededRandFromKey(roomKey + ':imp'), players)
  const chosenWord = pickDeterministic(seededRandFromKey(roomKey + ':word'), words)
  const startPlayerIndex = numberFromRng(seededRandFromKey(roomKey + ':start'), players)
  
  return {
    players,
    round,
    category,
    activePlayer: null,
    revealed: false,
    impostorIndex,
    chosenWord,
    startPlayerIndex,
    gameStarted: false
  }
}