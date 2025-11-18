<template>
  <div class="fixed inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-8 fade-in">
        <h2 class="text-4xl md:text-6xl font-bold text-white mb-4">
          {{ title }}
        </h2>
        <p class="text-xl md:text-2xl text-blue-100 mb-2">
          {{ subtitle }}
        </p>
        <p class="text-lg text-blue-200">
          👑 Player {{ startPlayerIndex + 1 }} starts the discussion
        </p>
        <div v-if="gameInfo" class="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-2xl mx-auto">
          <p class="text-blue-100 text-sm" v-html="gameInfo"></p>
        </div>
      </div>

      <!-- Player Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        <button
          v-for="(_, idx) in Array.from({ length: playerCount })"
          :key="idx"
          @click="$emit('select-player', idx)"
          class="group relative bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:border-white/40 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/30"
          :class="{
            'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 shadow-2xl transform scale-105': idx === startPlayerIndex,
            'animate-pulse': idx === startPlayerIndex
          }"
        >
          <!-- Crown for starting player -->
          <div v-if="idx === startPlayerIndex" class="absolute -top-3 -right-3 text-3xl md:text-4xl animate-bounce">
            👑
          </div>

          <!-- Player Avatar -->
          <div class="text-4xl md:text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">
            🎭
          </div>

          <!-- Player Number -->
          <div class="text-2xl md:text-3xl font-bold text-white group-hover:text-yellow-200 transition-colors duration-300">
            Player {{ idx + 1 }}
          </div>

          <!-- Starting player indicator -->
          <div v-if="idx === startPlayerIndex" class="text-sm md:text-base text-yellow-100 font-medium mt-2">
            Goes First!
          </div>

          <!-- Hover effect overlay -->
          <div class="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <!-- Ripple effect -->
          <div class="absolute inset-0 rounded-2xl overflow-hidden">
            <div class="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 rounded-full"></div>
          </div>
        </button>
      </div>

      <!-- Instructions -->
      <div class="text-center mt-8 fade-in">
        <p class="text-blue-100 text-lg">
          {{ instructions }}
        </p>
        <p v-if="secondaryInstructions" class="text-blue-200 text-sm mt-2">
          {{ secondaryInstructions }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  playerCount: number
  startPlayerIndex: number
  instructions: string
  secondaryInstructions?: string
  gameInfo?: string
}>()

defineEmits<{
  (e: 'select-player', index: number): void
}>()
</script>
