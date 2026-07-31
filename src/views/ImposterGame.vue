<template>
  <div class="min-h-screen safe-page">
    <div class="mx-auto w-full max-w-md">
      <!-- HOME -->
      <div v-if="screen === 'home'" class="animate-fade-up space-y-8 pt-6">
        <router-link to="/" class="btn-ghost -ml-2 inline-flex h-9 px-2 text-sm">← All games</router-link>

        <header class="pt-4">
          <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-mint">
            <span class="h-2 w-2 rounded-full bg-mint"></span> Imposter
          </div>
          <h1 class="mt-3 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Everyone gets<br />the word.<br /><span class="text-mint">Except one.</span>
          </h1>
          <p class="mt-4 max-w-sm text-mist">
            A fast party word game. Blend in, sniff out the faker, and don't blow your cover.
          </p>
        </header>

        <div class="space-y-3">
          <button class="btn-primary w-full" @click="go('online')">
            🌐 Play with friends
          </button>
          <button class="btn-secondary w-full" @click="go('solo')">
            📱 Play on this device
          </button>
        </div>

        <form class="card space-y-3 p-5" @submit.prevent="joinByCode">
          <label class="label">Have a code?</label>
          <div class="flex gap-2">
            <input
              v-model="joinCode"
              class="field flex-1 text-center font-display text-xl uppercase tracking-[0.25em]"
              placeholder="ABCD"
              maxlength="4"
              autocapitalize="characters"
              @input="joinCode = joinCode.toUpperCase().replace(/[^A-Z0-9]/g, '')"
            />
            <button class="btn-primary px-6" :disabled="joinCode.length < 4">Join</button>
          </div>
        </form>

        <details class="card px-5 py-4">
          <summary class="cursor-pointer list-none font-medium text-mist">How to play</summary>
          <ol class="mt-3 space-y-2 text-sm text-fog">
            <li>1. Everyone gets the same secret word — except the imposter, who gets a subtle hint.</li>
            <li>2. Take turns describing the word without saying it out loud.</li>
            <li>3. The imposter fakes it and tries to guess the word.</li>
            <li>4. Talk it out, then vote: who's the imposter?</li>
          </ol>
        </details>

        <p class="pb-2 text-center text-xs text-fog">Best with 4+ people in a room 🕵️</p>
      </div>

      <!-- ONLINE -->
      <OnlineGame v-else-if="screen === 'online'" :initial-code="initialCode" @exit="goHome" />

      <!-- SOLO -->
      <SoloGame v-else @exit="goHome" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import OnlineGame from '@/components/OnlineGame.vue'
import SoloGame from '@/components/SoloGame.vue'

const route = useRoute()
const screen = ref<'home' | 'online' | 'solo'>('home')
const initialCode = ref<string | undefined>(undefined)
const joinCode = ref('')

function go(s: 'online' | 'solo') {
  screen.value = s
}

function goHome() {
  screen.value = 'home'
  initialCode.value = undefined
}

function joinByCode() {
  if (joinCode.value.length < 4) return
  initialCode.value = joinCode.value.toUpperCase()
  screen.value = 'online'
}

onMounted(() => {
  const room = route.query.room
  if (typeof room === 'string' && room.length >= 4) {
    initialCode.value = room.toUpperCase()
    screen.value = 'online'
  }
})
</script>
