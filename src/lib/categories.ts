// Category NAMES only (never the words — those live on the server). Used to render the
// picker instantly and as a fallback if /api/categories can't be reached.
export const FALLBACK_CATEGORIES = [
  'Random',
  'Gen Z Vibes',
  'Psychedelic Trip',
  'Viral Internet',
  'Fantasy Realms',
  'Street Food',
  'Retro Gaming',
  'Space Odyssey',
  'Urban Legends',
  'Coffee Culture',
  'Extreme Sports',
  'Mystical Artifacts',
  'Dystopian Future',
  'Comfort Things',
  'Ocean Mysteries',
  'Cozy Aesthetics',
  'Indian',
]

// A tiny emoji per category, just for a bit of flavor in the picker.
export const CATEGORY_EMOJI: Record<string, string> = {
  Random: '🎲',
  'Gen Z Vibes': '💅',
  'Psychedelic Trip': '🌀',
  'Viral Internet': '📱',
  'Fantasy Realms': '🐉',
  'Street Food': '🌮',
  'Retro Gaming': '🕹️',
  'Space Odyssey': '🚀',
  'Urban Legends': '👻',
  'Coffee Culture': '☕',
  'Extreme Sports': '🏂',
  'Mystical Artifacts': '🔮',
  'Dystopian Future': '🤖',
  'Comfort Things': '🧸',
  'Ocean Mysteries': '🌊',
  'Cozy Aesthetics': '🌿',
  Indian: '🪔',
}
