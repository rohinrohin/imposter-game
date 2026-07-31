<template>
  <ul class="space-y-2">
    <li
      v-for="p in players"
      :key="p.id"
      class="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 px-3 py-2.5"
    >
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-ink-950"
        :style="{ backgroundColor: avatarColor(p.id) }"
      >
        {{ initial(p.name) }}
      </span>
      <span class="min-w-0 flex-1 truncate font-medium">
        {{ p.name }}
        <span v-if="p.id === youId" class="text-fog">(you)</span>
      </span>
      <span
        v-if="p.isHost"
        class="rounded-full border border-amber/30 bg-amber-soft px-2 py-0.5 text-[11px] font-semibold text-amber"
      >
        👑 Host
      </span>
      <span
        class="h-2 w-2 shrink-0 rounded-full"
        :class="p.connected ? 'bg-mint' : 'bg-ink-600'"
        :title="p.connected ? 'Connected' : 'Away'"
      ></span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { PublicPlayer } from '@/lib/roomTypes'

defineProps<{ players: PublicPlayer[]; youId?: string }>()

function initial(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}

// Deterministic, calm avatar tints keyed off the player id.
const PALETTE = ['#34D399', '#F6C560', '#7DD3FC', '#FB6F6F', '#C4B5FD', '#FBBF77', '#5EEAD4', '#F0ABFC']
function avatarColor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}
</script>
