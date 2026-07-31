// Small localStorage helpers so a player keeps their name and their identity in a
// room across reloads (so a refresh reconnects as the same seat, not a new one).

const NAME_KEY = 'imp:name'

export function getSavedName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {}
}

function pidKey(code: string) {
  return `imp:pid:${code.toUpperCase()}`
}

export function getSavedPid(code: string): string {
  try {
    return localStorage.getItem(pidKey(code)) ?? ''
  } catch {
    return ''
  }
}

export function savePid(code: string, pid: string) {
  try {
    localStorage.setItem(pidKey(code), pid)
  } catch {}
}

export function newSeed(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
