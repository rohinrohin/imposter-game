import { ref, onUnmounted } from 'vue'
import type { PersonalState, ConnStatus } from '@/lib/roomTypes'
import { fetchState, sendAction } from '@/lib/api'

/**
 * Live room connection with graceful degradation:
 *   1. WebSocket for instant push (status = 'live').
 *   2. If the socket drops, auto-reconnect with exponential backoff.
 *   3. While the socket is down, poll /state every few seconds so the game keeps
 *      working (status = 'reconnecting'); if even polling fails, status = 'offline'.
 * Actions go over the socket when live, otherwise over HTTP — so the host can always
 * advance the round even on a flaky connection, and the DO rebroadcasts to everyone.
 */
export function useRoom() {
  const state = ref<PersonalState | null>(null)
  const status = ref<ConnStatus>('connecting')
  const error = ref<string | null>(null)

  let ws: WebSocket | null = null
  let code = ''
  let playerId = ''
  let attempts = 0
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let pingTimer: ReturnType<typeof setInterval> | null = null
  let closedByUs = false

  function wsUrl() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    return `${proto}://${location.host}/api/room/${code}/ws?playerId=${encodeURIComponent(playerId)}`
  }

  function openWs() {
    try {
      ws = new WebSocket(wsUrl())
    } catch {
      scheduleReconnect()
      return
    }
    ws.onopen = () => {
      attempts = 0
      status.value = 'live'
      stopPolling()
      startPing()
    }
    ws.onmessage = (e) => {
      let msg: any
      try {
        msg = JSON.parse(e.data)
      } catch {
        return
      }
      if (msg.type === 'state') {
        state.value = msg.state
        error.value = null
      } else if (msg.type === 'error') {
        error.value = msg.error
      }
    }
    ws.onclose = () => {
      stopPing()
      if (!closedByUs) {
        startPolling()
        scheduleReconnect()
      }
    }
    ws.onerror = () => {
      try {
        ws?.close()
      } catch {}
    }
  }

  function scheduleReconnect() {
    if (closedByUs || reconnectTimer) return
    status.value = state.value ? 'reconnecting' : 'connecting'
    attempts++
    const delay = Math.min(15000, 400 * 2 ** attempts) + Math.random() * 300
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      openWs()
    }, delay)
  }

  function startPolling() {
    if (pollTimer) return
    void poll()
    pollTimer = setInterval(poll, 2500)
  }

  async function poll() {
    try {
      const { state: s } = await fetchState(code, playerId)
      state.value = s
      if (status.value === 'offline') status.value = 'reconnecting'
    } catch {
      if (ws?.readyState !== WebSocket.OPEN) status.value = 'offline'
    }
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function startPing() {
    stopPing()
    pingTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping', t: Date.now() }))
    }, 25000)
  }

  function stopPing() {
    if (pingTimer) {
      clearInterval(pingTimer)
      pingTimer = null
    }
  }

  function onVisible() {
    if (document.visibilityState === 'visible' && !closedByUs && ws?.readyState !== WebSocket.OPEN) {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      attempts = 0
      openWs()
      void poll()
    }
  }

  async function connect(c: string, pid: string, initial?: PersonalState) {
    code = c
    playerId = pid
    closedByUs = false
    if (initial) state.value = initial
    document.addEventListener('visibilitychange', onVisible)
    // Prime state via HTTP immediately, then upgrade to the live socket.
    if (!initial) void poll()
    openWs()
  }

  /** Fire a game action — over the socket if live, else HTTP fallback. */
  async function act(action: string, extra: Record<string, unknown> = {}) {
    error.value = null
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'action', action, ...extra }))
      return
    }
    try {
      const { state: s } = await sendAction(code, playerId, action, extra)
      state.value = s
    } catch (e: any) {
      error.value = e?.code ?? 'action_failed'
    }
  }

  function disconnect() {
    closedByUs = true
    stopPolling()
    stopPing()
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    document.removeEventListener('visibilitychange', onVisible)
    try {
      ws?.close()
    } catch {}
    ws = null
  }

  onUnmounted(disconnect)

  return { state, status, error, connect, act, disconnect }
}
