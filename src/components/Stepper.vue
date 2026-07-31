<template>
  <div class="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-800 p-2">
    <button
      class="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-900 text-2xl text-snow transition active:scale-90 disabled:opacity-30"
      :disabled="modelValue <= min"
      aria-label="Fewer"
      @click="set(modelValue - 1)"
    >
      −
    </button>
    <div class="text-center">
      <div class="font-display text-3xl font-bold tabular-nums">{{ modelValue }}</div>
      <div class="label -mt-1">{{ unit }}</div>
    </div>
    <button
      class="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-900 text-2xl text-snow transition active:scale-90 disabled:opacity-30"
      :disabled="modelValue >= max"
      aria-label="More"
      @click="set(modelValue + 1)"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: number; min: number; max: number; unit?: string }>()
const emit = defineEmits<{ 'update:modelValue': [n: number] }>()

function set(n: number) {
  emit('update:modelValue', Math.max(props.min, Math.min(props.max, n)))
}
</script>
