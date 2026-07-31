<template>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
    <button
      v-for="c in categories"
      :key="c"
      type="button"
      class="flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-medium transition"
      :class="
        c === modelValue
          ? 'border-mint bg-mint-soft text-snow'
          : 'border-ink-700 bg-ink-900 text-mist hover:border-ink-600'
      "
      @click="emit('update:modelValue', c)"
    >
      <span class="text-lg leading-none">{{ emoji(c) }}</span>
      <span class="truncate">{{ c }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { CATEGORY_EMOJI } from '@/lib/categories'

defineProps<{ modelValue: string; categories: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [c: string] }>()

function emoji(c: string): string {
  return CATEGORY_EMOJI[c] ?? '🎯'
}
</script>
