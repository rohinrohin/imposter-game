<template>
  <div class="mx-auto w-full max-w-md">
    <!-- ENTRY: create or join -->
    <div v-if="screen === 'entry'" class="animate-fade-up space-y-5">
      <button class="btn-ghost -ml-2 h-9 px-2 text-sm" @click="$emit('exit')">← Back</button>

      <div v-if="mode === 'menu'" class="space-y-3">
        <h1 class="font-display text-3xl font-bold">Play with friends</h1>
        <p class="text-fog">Everyone joins on their own phone. One room, one code.</p>
        <button class="btn-primary mt-2 w-full" @click="mode = 'create'">Create a room</button>
        <button class="btn-secondary w-full" @click="mode = 'join'">Join with a code</button>
      </div>

      <form v-else-if="mode === 'create'" class="space-y-5" @submit.prevent="create">
        <div class="space-y-2">
          <label class="label">Your name</label>
          <input v-model="name" class="field" placeholder="e.g. Rohin" maxlength="24" autofocus />
        </div>
        <div class="space-y-2">
          <label class="label">Category</label>
          <CategorySelect v-model="category" :categories="categories" />
        </div>
        <p v-if="err" class="text-sm text-coral">{{ err }}</p>
        <button class="btn-primary w-full" :disabled="!name.trim() || busy">
          {{ busy ? 'Creating…' : 'Create room' }}
        </button>
        <button type="button" class="btn-ghost w-full text-sm" @click="mode = 'menu'">Back</button>
      </form>

      <form v-else class="space-y-5" @submit.prevent="join">
        <div class="space-y-2">
          <label class="label">Room code</label>
          <input
            v-model="code"
            class="field text-center font-display text-2xl uppercase tracking-[0.3em]"
            placeholder="ABCD"
            maxlength="4"
            autocapitalize="characters"
            @input="code = code.toUpperCase().replace(/[^A-Z0-9]/g, '')"
          />
        </div>
        <div class="space-y-2">
          <label class="label">Your name</label>
          <input v-model="name" class="field" placeholder="e.g. Rohin" maxlength="24" />
        </div>
        <p v-if="err" class="text-sm text-coral">{{ err }}</p>
        <button class="btn-primary w-full" :disabled="code.length < 4 || !name.trim() || busy">
          {{ busy ? 'Joining…' : 'Join room' }}
        </button>
        <button type="button" class="btn-ghost w-full text-sm" @click="mode = 'menu'">Back</button>
      </form>
    </div>

    <!-- IN ROOM -->
    <div v-else class="animate-fade-up space-y-5">
      <!-- header -->
      <div class="flex items-center justify-between">
        <button class="btn-ghost -ml-2 h-9 px-2 text-sm" @click="leave">← Leave</button>
        <ConnectionPill :status="room.status.value" />
      </div>

      <template v-if="state">
        <!-- LOBBY -->
        <template v-if="state.phase === 'lobby'">
          <ShareCode :code="state.code" />

          <div class="card p-5">
            <div class="mb-3 flex items-center justify-between">
              <p class="label">Players · {{ state.players.length }}</p>
              <p class="text-xs text-fog">min {{ state.minPlayers }} to start</p>
            </div>
            <PlayerList :players="state.players" :you-id="state.you?.id" />
          </div>

          <div v-if="isHost" class="space-y-3">
            <div class="card p-5">
              <p class="label mb-3">Category</p>
              <CategorySelect
                :model-value="state.category"
                :categories="categories"
                @update:model-value="setCategory"
              />
            </div>
            <button class="btn-primary w-full" :disabled="!canStart" @click="room.act('start')">
              {{ canStart ? 'Start game' : `Need ${state.minPlayers - state.players.length} more` }}
            </button>
          </div>
          <div v-else class="card p-5 text-center">
            <p class="text-mist">Waiting for the host to start…</p>
            <p class="mt-1 text-sm text-fog">{{ emoji(state.category) }} {{ state.category }}</p>
          </div>
        </template>

        <!-- ROUND -->
        <template v-else>
          <RoleCard
            :role="state.role"
            :round="state.round"
            :category="state.actualCategory ?? state.category"
            :starting-name="state.startingPlayerName"
          />

          <div v-if="isHost" class="space-y-2">
            <button class="btn-primary w-full" @click="room.act('next')">Next round →</button>
            <button class="btn-secondary w-full" @click="room.act('lobby')">Back to lobby</button>
          </div>
          <div v-else class="card p-4 text-center text-sm text-fog">
            Waiting for the host to start the next round…
          </div>

          <details class="card px-5 py-3">
            <summary class="cursor-pointer list-none text-sm text-fog">
              Players · {{ state.players.length }}
            </summary>
            <div class="mt-3">
              <PlayerList :players="state.players" :you-id="state.you?.id" />
            </div>
          </details>
        </template>

        <p v-if="actionError" class="text-center text-sm text-coral">{{ actionError }}</p>
      </template>

      <div v-else class="card p-8 text-center text-fog">Connecting to the room…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoom } from '@/composables/useRoom'
import { createRoom, joinRoom, getCategories, ApiError } from '@/lib/api'
import { getSavedName, saveName, getSavedPid, savePid } from '@/lib/session'
import { FALLBACK_CATEGORIES, CATEGORY_EMOJI } from '@/lib/categories'
import ShareCode from './ShareCode.vue'
import PlayerList from './PlayerList.vue'
import RoleCard from './RoleCard.vue'
import CategorySelect from './CategorySelect.vue'
import ConnectionPill from './ConnectionPill.vue'

const props = defineProps<{ initialCode?: string }>()
const emit = defineEmits<{ exit: [] }>()

const room = useRoom()
const state = room.state

const screen = ref<'entry' | 'inroom'>('entry')
const mode = ref<'menu' | 'create' | 'join'>('menu')
const name = ref(getSavedName())
const code = ref('')
const category = ref('Random')
const categories = ref<string[]>(FALLBACK_CATEGORIES)
const busy = ref(false)
const err = ref('')

const isHost = computed(() => !!state.value?.you?.isHost)
const canStart = computed(() => !!state.value && state.value.players.length >= state.value.minPlayers)

const ERRORS: Record<string, string> = {
  not_found: "That room doesn't exist (or it expired). Check the code.",
  need_more_players: 'Need more players to start.',
  host_only: 'Only the host can do that.',
  request_failed: 'Something went wrong. Try again.',
}
const actionError = computed(() => (room.error.value ? (ERRORS[room.error.value] ?? null) : null))

function emoji(c: string) {
  return CATEGORY_EMOJI[c] ?? '🎯'
}

function setUrl(c: string | null) {
  const url = c ? `/imposter-game?room=${c}` : '/imposter-game'
  history.replaceState(history.state, '', url)
}

function setCategory(c: string) {
  room.act('setCategory', { category: c })
}

async function create() {
  err.value = ''
  busy.value = true
  try {
    const res = await createRoom(name.value.trim(), category.value)
    saveName(name.value.trim())
    savePid(res.code, res.playerId)
    setUrl(res.code)
    await room.connect(res.code, res.playerId, res.state)
    screen.value = 'inroom'
  } catch (e) {
    err.value = e instanceof ApiError ? (ERRORS[e.code] ?? 'Could not create the room.') : 'Could not create the room.'
  } finally {
    busy.value = false
  }
}

async function join() {
  err.value = ''
  busy.value = true
  try {
    const c = code.value.toUpperCase()
    const savedPid = getSavedPid(c)
    const res = await joinRoom(c, name.value.trim(), savedPid || undefined)
    saveName(name.value.trim())
    savePid(c, res.playerId)
    setUrl(c)
    await room.connect(c, res.playerId, res.state)
    screen.value = 'inroom'
  } catch (e) {
    err.value = e instanceof ApiError ? (ERRORS[e.code] ?? 'Could not join the room.') : 'Could not join the room.'
  } finally {
    busy.value = false
  }
}

function leave() {
  room.act('leave')
  room.disconnect()
  setUrl(null)
  emit('exit')
}

watch(mode, () => (err.value = ''))

onMounted(async () => {
  try {
    const { categories: cats } = await getCategories()
    if (cats?.length) categories.value = cats
  } catch {
    // keep fallback list
  }

  // Deep link: /imposter-game?room=CODE
  if (props.initialCode) {
    code.value = props.initialCode.toUpperCase()
    const savedPid = getSavedPid(code.value)
    if (savedPid && getSavedName()) {
      // Seamless rejoin.
      await join()
    } else {
      mode.value = 'join'
    }
  }
})
</script>
