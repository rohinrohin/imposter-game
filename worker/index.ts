import { RoomDurableObject } from './room'
import { WORD_BANK, CATEGORY_NAMES, getHintForWord } from './words'
import { seededRand, pick, intFromRng } from './rng'
import type { PersonalRole } from './types'

// Codes use an unambiguous alphabet (no O/0/I/1) so they're easy to read aloud & type.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function makeCode(len = 4): string {
  const buf = new Uint32Array(len)
  crypto.getRandomValues(buf)
  let out = ''
  for (let i = 0; i < len; i++) out += CODE_ALPHABET[buf[i] % CODE_ALPHABET.length]
  return out
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) return handleApi(request, env, url)
    // Everything else -> static assets, with SPA fallback (configured in wrangler.jsonc).
    return env.ASSETS.fetch(request)
  },
}

export { RoomDurableObject }

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  const p = url.pathname

  if (p === '/api/categories') {
    return json({ categories: ['Random', ...CATEGORY_NAMES] })
  }

  if (p === '/api/solo/reveal' && request.method === 'POST') {
    return soloReveal(request)
  }

  if (p === '/api/room/create' && request.method === 'POST') {
    return roomCreate(request, env)
  }

  // /api/room/:code/(ws|join|state|action)
  const m = p.match(/^\/api\/room\/([^/]+)\/(ws|join|state|action)$/)
  if (m) {
    const code = m[1].toUpperCase()
    const stub = env.ROOMS.get(env.ROOMS.idFromName(code))
    const fwdUrl = new URL(request.url)
    fwdUrl.pathname = `/api/room/${code}/${m[2]}`
    return stub.fetch(new Request(fwdUrl, request))
  }

  return json({ error: 'not_found' }, 404)
}

async function roomCreate(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => ({}))
  // Retry on the astronomically-unlikely code collision.
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = makeCode()
    const stub = env.ROOMS.get(env.ROOMS.idFromName(code))
    const res = await stub.fetch(
      new Request(`https://do/api/room/${code}/create`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
    )
    if (res.status !== 409) {
      const data = await res.json()
      return json({ ...(data as object), code }, res.status)
    }
  }
  return json({ error: 'code_collision' }, 500)
}

// Stateless pass-and-play reveal: the device asks for one seat's view at a time.
// Word selection stays here so the client bundle never contains the word bank.
async function soloReveal(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as {
    seed?: string
    category?: string
    players?: number
    round?: number
    seat?: number
  }
  const seed = String(body.seed ?? 'x')
  const players = Math.max(3, Math.min(20, Math.floor(body.players ?? 3)))
  const round = Math.max(1, Math.floor(body.round ?? 1))
  const seat = Math.max(0, Math.min(players - 1, Math.floor(body.seat ?? 0)))
  const requested = body.category ?? 'Random'

  let actualCategory = requested
  if (actualCategory === 'Random' || !WORD_BANK[actualCategory]) {
    actualCategory = pick(seededRand(`${seed}:cat:${round}`), CATEGORY_NAMES)
  }
  const words = WORD_BANK[actualCategory]
  const word = pick(seededRand(`${seed}:word:${round}`), words)
  const impostorSeat = intFromRng(seededRand(`${seed}:imp:${round}`), players)
  const startingSeat = intFromRng(seededRand(`${seed}:start:${round}`), players)

  const role: PersonalRole =
    seat === impostorSeat
      ? { status: 'impostor', hint: getHintForWord(word) }
      : { status: 'crew', word }

  return json({
    actualCategory,
    startingPlayer: startingSeat + 1, // 1-based for display
    players,
    round,
    seat,
    role,
  })
}
