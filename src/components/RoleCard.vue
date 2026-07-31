<template>
  <div class="animate-pop-in">
    <!-- Pending: joined mid-round -->
    <div v-if="!role || role.status === 'pending'" class="card p-8 text-center">
      <div class="text-4xl">⏳</div>
      <p class="mt-3 text-lg font-medium text-mist">You're in for the next round</p>
      <p class="mt-1 text-sm text-fog">Sit tight — the host will deal you in when this round ends.</p>
    </div>

    <!-- Impostor -->
    <div
      v-else-if="role.status === 'impostor'"
      class="rounded-2xl border border-coral/40 bg-coral-soft p-7 text-center"
    >
      <p class="label text-coral/80">Your role</p>
      <h2 class="mt-2 font-display text-5xl font-bold tracking-tight text-coral">Imposter</h2>
      <p class="mt-3 text-mist">You don't know the word. Blend in.</p>

      <div class="mt-6 rounded-xl border border-ink-700 bg-ink-950/40 p-4 text-left">
        <p class="label">Your subtle hint</p>
        <p class="mt-1 font-display text-lg italic leading-snug text-amber">“{{ role.hint }}”</p>
        <p class="mt-2 text-xs text-fog">Enough to bluff the first round — don't say it out loud.</p>
      </div>
    </div>

    <!-- Crew -->
    <div v-else class="rounded-2xl border border-mint/40 bg-mint-soft p-7 text-center">
      <p class="label text-mint/80">Your secret word</p>
      <h2 class="mt-2 break-words font-display text-5xl font-bold uppercase tracking-tight text-mint sm:text-6xl">
        {{ role.word }}
      </h2>
      <p class="mt-4 text-sm text-mist">Describe it without saying it. Sniff out who's faking.</p>
    </div>

    <!-- Round meta -->
    <div class="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-fog">
      <span v-if="category">{{ emoji }} {{ category }}</span>
      <span v-if="startingName" class="text-amber">👑 {{ startingName }} starts</span>
      <span>Round {{ round }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PersonalRole } from '@/lib/roomTypes'
import { CATEGORY_EMOJI } from '@/lib/categories'

const props = defineProps<{
  role: PersonalRole
  round: number
  category: string | null
  startingName: string | null
}>()

const emoji = computed(() => (props.category ? (CATEGORY_EMOJI[props.category] ?? '🎯') : '🎯'))
</script>
