import { DurableObject } from 'cloudflare:workers'
import { WORD_BANK, CATEGORY_NAMES, getHintForWord } from './words'
import type { RoomState, Player, PersonalState, PublicPlayer, PersonalRole } from './types'

const MIN_PLAYERS = 3
const ROOM_TTL_MS = 12 * 60 * 60 * 1000 // rooms self-destruct 12h after last activity
const MAX_NAME = 24

function randInt(max: number): number {
  if (max <= 0) return 0
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] % max
}

function pickRandom<T>(arr: T[]): T {
  return arr[randInt(arr.length)]
}

function cleanName(name: unknown): string {
  const s = (typeof name === 'string' ? name : '').trim().replace(/\s+/g, ' ')
  return s.slice(0, MAX_NAME) || 'Player'
}

interface ActionResult {
  ok: boolean
  status?: number
  error?: string
}

export class RoomDurableObject extends DurableObject {
  // ---- persistence (hibernation-safe: always load from storage) ----
  async load(): Promise<RoomState | null> {
    return (await this.ctx.storage.get<RoomState>('room')) ?? null
  }

  async save(state: RoomState): Promise<void> {
    state.updatedAt = Date.now()
    await this.ctx.storage.put('room', state)
    await this.ctx.storage.setAlarm(Date.now() + ROOM_TTL_MS)
  }

  // ---- HTTP entry (forwarded from the Worker) ----
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const seg = url.pathname.split('/').filter(Boolean) // ['api','room',CODE,ACTION]
    const code = seg[2] ?? ''
    const action = seg[3] ?? ''

    if (action === 'ws') return this.handleWebSocketUpgrade(request, code, url)

    let body: any = {}
    if (request.method === 'POST') {
      try {
        body = await request.json()
      } catch {
        body = {}
      }
    } else {
      body = Object.fromEntries(url.searchParams.entries())
    }

    if (action === 'create') return this.httpCreate(code, body)
    if (action === 'join') return this.httpJoin(code, body)
    if (action === 'state') return this.httpState(body)
    if (action === 'action') return this.httpAction(body)

    return json({ error: 'not_found' }, 404)
  }

  // ---- WebSocket ----
  async handleWebSocketUpgrade(request: Request, code: string, url: URL): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('expected websocket', { status: 426 })
    }
    const playerId = url.searchParams.get('playerId') ?? ''
    const state = await this.load()
    if (!state || state.code !== code) return new Response('no such room', { status: 404 })

    const pair = new WebSocketPair()
    const [client, server] = [pair[0], pair[1]]
    // Tag with playerId so we can find/replace a player's sockets. Hibernation-safe
    // metadata via attachment.
    this.ctx.acceptWebSocket(server, [playerId || 'anon'])
    server.serializeAttachment({ playerId })

    // Send this player their current view immediately.
    server.send(JSON.stringify({ type: 'state', state: this.personalize(state, playerId) }))
    // Someone (re)connected — let everyone refresh presence.
    await this.broadcast(state)

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    let msg: any
    try {
      msg = JSON.parse(typeof message === 'string' ? message : new TextDecoder().decode(message))
    } catch {
      return
    }
    const att = (ws.deserializeAttachment() as { playerId?: string }) || {}
    const playerId = att.playerId ?? ''

    if (msg.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong', t: msg.t ?? null }))
      return
    }
    if (msg.type === 'action') {
      const state = await this.load()
      if (!state) return
      const res = this.applyAction(state, playerId, msg.action, msg)
      if (!res.ok) {
        ws.send(JSON.stringify({ type: 'error', error: res.error ?? 'error' }))
        return
      }
      await this.save(state)
      await this.broadcast(state)
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    try {
      ws.close()
    } catch {}
    const state = await this.load()
    if (state) await this.broadcast(state)
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    const state = await this.load()
    if (state) await this.broadcast(state)
  }

  // A player is "connected" if they currently hold at least one live socket.
  connectedIds(): Set<string> {
    const ids = new Set<string>()
    for (const ws of this.ctx.getWebSockets()) {
      const att = (ws.deserializeAttachment() as { playerId?: string }) || {}
      if (att.playerId) ids.add(att.playerId)
    }
    return ids
  }

  async broadcast(state: RoomState): Promise<void> {
    for (const ws of this.ctx.getWebSockets()) {
      const att = (ws.deserializeAttachment() as { playerId?: string }) || {}
      try {
        ws.send(JSON.stringify({ type: 'state', state: this.personalize(state, att.playerId ?? '') }))
      } catch {}
    }
  }

  // ---- HTTP handlers ----
  async httpCreate(code: string, body: any): Promise<Response> {
    const existing = await this.load()
    if (existing) return json({ error: 'exists' }, 409)
    const playerId = randomId()
    const now = Date.now()
    const category = CATEGORY_NAMES.includes(body.category) || body.category === 'Random' ? body.category : 'Random'
    const state: RoomState = {
      code,
      hostId: playerId,
      phase: 'lobby',
      round: 0,
      category,
      players: [{ id: playerId, name: cleanName(body.name), joinedAt: now }],
      current: null,
      createdAt: now,
      updatedAt: now,
    }
    await this.save(state)
    return json({ playerId, state: this.personalize(state, playerId) })
  }

  async httpJoin(code: string, body: any): Promise<Response> {
    const state = await this.load()
    if (!state || state.code !== code) return json({ error: 'not_found' }, 404)

    let playerId: string = typeof body.playerId === 'string' ? body.playerId : ''
    const existing = state.players.find((p) => p.id === playerId)
    if (existing) {
      if (body.name) existing.name = cleanName(body.name)
    } else {
      playerId = randomId()
      state.players.push({ id: playerId, name: cleanName(body.name), joinedAt: Date.now() })
    }
    await this.save(state)
    await this.broadcast(state)
    return json({ playerId, state: this.personalize(state, playerId) })
  }

  async httpState(body: any): Promise<Response> {
    const state = await this.load()
    if (!state) return json({ error: 'not_found' }, 404)
    const playerId = typeof body.playerId === 'string' ? body.playerId : ''
    return json({ state: this.personalize(state, playerId) })
  }

  async httpAction(body: any): Promise<Response> {
    const state = await this.load()
    if (!state) return json({ error: 'not_found' }, 404)
    const playerId = typeof body.playerId === 'string' ? body.playerId : ''
    const res = this.applyAction(state, playerId, body.action, body)
    if (!res.ok) return json({ error: res.error ?? 'error' }, res.status ?? 400)
    await this.save(state)
    await this.broadcast(state)
    return json({ state: this.personalize(state, playerId) })
  }

  // ---- game logic (host authoritative) ----
  applyAction(state: RoomState, playerId: string, action: string, args: any): ActionResult {
    const isHost = playerId === state.hostId
    switch (action) {
      case 'setCategory': {
        if (!isHost) return { ok: false, status: 403, error: 'host_only' }
        if (state.phase !== 'lobby') return { ok: false, error: 'not_in_lobby' }
        const cat = args.category
        if (cat !== 'Random' && !CATEGORY_NAMES.includes(cat)) return { ok: false, error: 'bad_category' }
        state.category = cat
        return { ok: true }
      }
      case 'rename': {
        const p = state.players.find((x) => x.id === playerId)
        if (!p) return { ok: false, error: 'not_in_room' }
        p.name = cleanName(args.name)
        return { ok: true }
      }
      case 'start':
      case 'next': {
        if (!isHost) return { ok: false, status: 403, error: 'host_only' }
        if (state.players.length < MIN_PLAYERS) return { ok: false, error: 'need_more_players' }
        state.phase = 'playing'
        state.round = action === 'start' ? 1 : state.round + 1
        state.current = this.computeRound(state)
        return { ok: true }
      }
      case 'lobby': {
        if (!isHost) return { ok: false, status: 403, error: 'host_only' }
        state.phase = 'lobby'
        state.current = null
        return { ok: true }
      }
      case 'leave': {
        const idx = state.players.findIndex((x) => x.id === playerId)
        if (idx === -1) return { ok: true }
        state.players.splice(idx, 1)
        if (state.hostId === playerId) {
          state.hostId = state.players[0]?.id ?? ''
        }
        if (state.players.length < MIN_PLAYERS && state.phase === 'playing') {
          state.phase = 'lobby'
          state.current = null
        }
        return { ok: true }
      }
      case 'kick': {
        if (!isHost) return { ok: false, status: 403, error: 'host_only' }
        const target = args.targetId
        state.players = state.players.filter((x) => x.id === state.hostId || x.id !== target)
        return { ok: true }
      }
      default:
        return { ok: false, error: 'unknown_action' }
    }
  }

  computeRound(state: RoomState) {
    let actualCategory = state.category
    if (actualCategory === 'Random' || !WORD_BANK[actualCategory]) {
      actualCategory = pickRandom(CATEGORY_NAMES)
    }
    const words = WORD_BANK[actualCategory]
    const word = pickRandom(words)
    const impostor = pickRandom(state.players)
    const starter = pickRandom(state.players)
    return {
      impostorId: impostor.id,
      word,
      actualCategory,
      startingPlayerId: starter.id,
      assignedIds: state.players.map((p) => p.id),
    }
  }

  // ---- build the per-player view (never leaks other roles / the word) ----
  personalize(state: RoomState, playerId: string): PersonalState {
    const connected = this.connectedIds()
    const you = state.players.find((p) => p.id === playerId) ?? null
    const players: PublicPlayer[] = state.players.map((p) => ({
      id: p.id,
      name: p.name,
      connected: connected.has(p.id),
      isHost: p.id === state.hostId,
    }))

    let role: PersonalRole = null
    let startingPlayerName: string | null = null
    if (state.phase === 'playing' && state.current) {
      const c = state.current
      startingPlayerName = state.players.find((p) => p.id === c.startingPlayerId)?.name ?? null
      if (!you || !c.assignedIds.includes(playerId)) {
        role = { status: 'pending' }
      } else if (c.impostorId === playerId) {
        role = { status: 'impostor', hint: getHintForWord(c.word) }
      } else {
        role = { status: 'crew', word: c.word }
      }
    }

    return {
      code: state.code,
      phase: state.phase,
      round: state.round,
      category: state.category,
      actualCategory: state.current?.actualCategory ?? null,
      minPlayers: MIN_PLAYERS,
      hostId: state.hostId,
      you: you ? { id: you.id, name: you.name, isHost: you.id === state.hostId } : null,
      players,
      startingPlayerName,
      role,
    }
  }

  // Room TTL cleanup.
  async alarm(): Promise<void> {
    const state = await this.load()
    if (!state) return
    if (Date.now() - state.updatedAt >= ROOM_TTL_MS && this.connectedIds().size === 0) {
      await this.ctx.storage.deleteAll()
    } else {
      await this.ctx.storage.setAlarm(Date.now() + ROOM_TTL_MS)
    }
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function randomId(): string {
  return crypto.randomUUID()
}
