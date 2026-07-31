<template>
  <div
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
    :class="cls.wrap"
    :title="title"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="cls.dot"></span>
    <span :class="cls.text">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConnStatus } from '@/lib/roomTypes'

const props = defineProps<{ status: ConnStatus }>()

const label = computed(
  () =>
    ({
      connecting: 'Connecting',
      live: 'Live',
      reconnecting: 'Reconnecting',
      offline: 'Offline',
    })[props.status],
)

const title = computed(
  () =>
    ({
      connecting: 'Connecting to the room…',
      live: 'Realtime connection is live',
      reconnecting: 'Connection dropped — retrying, game still works',
      offline: 'Offline — will resume automatically',
    })[props.status],
)

const cls = computed(() => {
  switch (props.status) {
    case 'live':
      return { wrap: 'border-mint/30 bg-mint-soft', dot: 'bg-mint', text: 'text-mint' }
    case 'reconnecting':
    case 'connecting':
      return { wrap: 'border-amber/30 bg-amber-soft', dot: 'bg-amber animate-soft-pulse', text: 'text-amber' }
    default:
      return { wrap: 'border-ink-700 bg-ink-800', dot: 'bg-fog', text: 'text-fog' }
  }
})
</script>
