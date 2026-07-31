import type { PersonalState, SoloReveal } from './roomTypes'

export class ApiError extends Error {
  code: string
  status: number
  constructor(code: string, status: number) {
    super(code)
    this.code = code
    this.status = status
  }
}

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...opts,
    headers: { 'content-type': 'application/json', ...(opts?.headers ?? {}) },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError((data && (data as any).error) || 'request_failed', res.status)
  return data as T
}

export function getCategories(): Promise<{ categories: string[] }> {
  return req('/api/categories')
}

export function createRoom(name: string, category: string): Promise<{ code: string; playerId: string; state: PersonalState }> {
  return req('/api/room/create', { method: 'POST', body: JSON.stringify({ name, category }) })
}

export function joinRoom(code: string, name: string, playerId?: string): Promise<{ playerId: string; state: PersonalState }> {
  return req(`/api/room/${code}/join`, { method: 'POST', body: JSON.stringify({ name, playerId }) })
}

export function fetchState(code: string, playerId: string): Promise<{ state: PersonalState }> {
  return req(`/api/room/${code}/state?playerId=${encodeURIComponent(playerId)}`)
}

export function sendAction(
  code: string,
  playerId: string,
  action: string,
  extra: Record<string, unknown> = {},
): Promise<{ state: PersonalState }> {
  return req(`/api/room/${code}/action`, {
    method: 'POST',
    body: JSON.stringify({ playerId, action, ...extra }),
  })
}

export function soloReveal(payload: {
  seed: string
  category: string
  players: number
  round: number
  seat: number
}): Promise<SoloReveal> {
  return req('/api/solo/reveal', { method: 'POST', body: JSON.stringify(payload) })
}
