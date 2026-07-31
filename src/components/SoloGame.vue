<template>
  <div class="mx-auto w-full max-w-md">
    <div class="mb-5 flex items-center justify-between">
      <button class="btn-ghost -ml-2 h-9 px-2 text-sm" @click="back">← Back</button>
      <span v-if="phase !== 'setup'" class="text-sm text-fog">Round {{ round }}</span>
    </div>

    <!-- SETUP -->
    <div v-if="phase === 'setup'" class="animate-fade-up space-y-6">
      <div>
        <h1 class="font-display text-3xl font-bold">Play on this device</h1>
        <p class="mt-1 text-fog">Pass the phone around. Each player peeks at their word in private.</p>
      </div>

      <div class="space-y-2">
        <label class="label">Players</label>
        <Stepper v-model="players" :min="3" :max="20" unit="players" />
      </div>

      <div class="space-y-2">
        <label class="label">Category</label>
        <CategorySelect v-model="category" :categories="categories" />
      </div>

      <button class="btn-primary w-full" @click="startGame">Start game</button>
    </div>

    <!-- HANDOFF -->
    <div v-else-if="phase === 'handoff'" class="animate-fade-up space-y-6 text-center">
      <div class="card p-8">
        <p class="label">Pass the phone to</p>
        <div class="mt-2 font-display text-4xl font-bold">Player {{ seat + 1 }}</div>
        <p class="mt-3 text-sm text-fog">Make sure nobody else is peeking.</p>
      </div>
      <p v-if="err" class="text-sm text-coral">{{ err }}</p>
      <button class="btn-primary w-full" :disabled="busy" @click="reveal">
        {{ busy ? 'Dealing…' : `I'm Player ${seat + 1} — reveal` }}
      </button>
    </div>

    <!-- REVEALED -->
    <div v-else-if="phase === 'revealed'" class="animate-fade-up space-y-6">
      <RoleCard
        :role="current"
        :round="round"
        :category="actualCategory"
        :starting-name="`Player ${startingPlayer}`"
      />
      <button class="btn-primary w-full" @click="nextSeat">
        {{ seat + 1 < players ? 'Hide & pass on' : 'Done — everyone has seen it' }}
      </button>
    </div>

    <!-- DISCUSS -->
    <div v-else class="animate-fade-up space-y-6 text-center">
      <div class="card p-8">
        <div class="text-4xl">🗣️</div>
        <h2 class="mt-3 font-display text-2xl font-bold">Everyone's in. Start talking.</h2>
        <p class="mt-2 text-mist">Describe the word without saying it. Find the imposter.</p>
        <div class="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-fog">
          <span>{{ emoji(actualCategory) }} {{ actualCategory }}</span>
          <span class="text-amber">👑 Player {{ startingPlayer }} starts</span>
        </div>
      </div>
      <button class="btn-primary w-full" @click="nextRound">Next round →</button>
      <button class="btn-secondary w-full" @click="phase = 'setup'">New game</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { soloReveal, getCategories } from '@/lib/api'
import { newSeed } from '@/lib/session'
import { FALLBACK_CATEGORIES, CATEGORY_EMOJI } from '@/lib/categories'
import type { PersonalRole } from '@/lib/roomTypes'
import Stepper from './Stepper.vue'
import CategorySelect from './CategorySelect.vue'
import RoleCard from './RoleCard.vue'

const emit = defineEmits<{ exit: [] }>()

const phase = ref<'setup' | 'handoff' | 'revealed' | 'discuss'>('setup')
const players = ref(4)
const category = ref('Random')
const categories = ref<string[]>(FALLBACK_CATEGORIES)

const seed = ref('')
const round = ref(1)
const seat = ref(0)
const current = ref<PersonalRole>(null)
const actualCategory = ref('')
const startingPlayer = ref(1)
const busy = ref(false)
const err = ref('')

function emoji(c: string) {
  return CATEGORY_EMOJI[c] ?? '🎯'
}

function startGame() {
  seed.value = newSeed()
  round.value = 1
  seat.value = 0
  phase.value = 'handoff'
}

async function reveal() {
  err.value = ''
  busy.value = true
  try {
    const res = await soloReveal({
      seed: seed.value,
      category: category.value,
      players: players.value,
      round: round.value,
      seat: seat.value,
    })
    current.value = res.role
    actualCategory.value = res.actualCategory
    startingPlayer.value = res.startingPlayer
    phase.value = 'revealed'
  } catch {
    err.value = 'Could not reach the server. Check your connection and try again.'
  } finally {
    busy.value = false
  }
}

function nextSeat() {
  if (seat.value + 1 < players.value) {
    seat.value += 1
    current.value = null
    phase.value = 'handoff'
  } else {
    phase.value = 'discuss'
  }
}

function nextRound() {
  round.value += 1
  seat.value = 0
  current.value = null
  phase.value = 'handoff'
}

function back() {
  if (phase.value === 'setup') emit('exit')
  else phase.value = 'setup'
}

onMounted(async () => {
  try {
    const { categories: cats } = await getCategories()
    if (cats?.length) categories.value = cats
  } catch {
    // keep fallback
  }
})
</script>
