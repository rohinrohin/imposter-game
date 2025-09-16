<template>
  <div class="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
    <div class="text-2xl">⏰</div>
    <div>
      <div class="text-sm text-gray-600">Discussion Time</div>
      <div class="text-2xl font-bold" :class="timeClass">
        {{ formatTime(timeLeft) }}
      </div>
    </div>
    <div class="flex space-x-2">
      <Button v-if="!isRunning" @click="startTimer" size="sm">
        ▶️ Start
      </Button>
      <Button v-else @click="pauseTimer" size="sm" variant="outline">
        ⏸️ Pause
      </Button>
      <Button @click="resetTimer" size="sm" variant="ghost">
        🔄 Reset
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  initialTime?: number // in seconds, default 5 minutes
}>()

const timeLeft = ref(props.initialTime || 300) // 5 minutes default
const isRunning = ref(false)
let intervalId: number | null = null

const timeClass = computed(() => {
  if (timeLeft.value <= 30) return 'text-red-600 animate-pulse'
  if (timeLeft.value <= 60) return 'text-orange-600'
  return 'text-green-600'
})

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function startTimer() {
  if (intervalId) return
  
  isRunning.value = true
  intervalId = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      pauseTimer()
      // Could emit an event here for when time runs out
    }
  }, 1000)
}

function pauseTimer() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  isRunning.value = false
}

function resetTimer() {
  pauseTimer()
  timeLeft.value = props.initialTime || 300
}

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>