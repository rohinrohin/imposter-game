<template>
  <div>
    <!-- Impostor Reveal -->
    <div v-if="isImpostor" class="space-y-8">
      <div class="text-8xl md:text-9xl animate-pulse">🕵️</div>
      <h2 class="text-5xl md:text-7xl font-bold text-red-500 animate-pulse mb-6">
        YOU ARE THE
      </h2>
      <h1 class="text-6xl md:text-8xl font-black text-red-400 mb-8 animate-bounce">
        IMPOSTOR!
      </h1>
      <div class="bg-red-900/30 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
        <p class="text-xl md:text-2xl text-red-200 mb-4">
          You don't know the secret word
        </p>
        <p class="text-lg md:text-xl text-red-300">
          🎯 Listen carefully and blend in<br/>
          🤫 Try to figure out the word<br/>
          🏃‍♂️ Avoid being caught!
        </p>
      </div>
      <div v-if="showStartPlayer" class="bg-yellow-900/30 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-4 max-w-xl mx-auto">
        <p class="text-yellow-200 text-sm">
          👑 Player {{ startPlayerIndex + 1 }} goes first in the discussion
        </p>
      </div>
    </div>

    <!-- Regular Player Word Reveal -->
    <div v-else class="space-y-8">
      <div class="text-6xl md:text-8xl mb-6">🎭</div>
      <h2 class="text-3xl md:text-4xl text-white mb-4">Your secret word is:</h2>
      <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl transform hover:scale-105 transition-transform duration-300">
        <p class="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-wider animate-pulse">
          {{ word }}
        </p>
      </div>
      <div class="bg-blue-900/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
        <p class="text-lg md:text-xl text-blue-200">
          💡 <strong>Remember:</strong> Describe it without saying the word directly!
        </p>
      </div>
      <div v-if="showGameInfo" class="bg-yellow-900/30 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-4 max-w-xl mx-auto">
        <p class="text-yellow-200 text-sm">
          👑 Player {{ startPlayerIndex + 1 }} goes first in the discussion
        </p>
        <p class="text-yellow-100 text-xs mt-2">
          🎯 Round {{ round }} • {{ category }} category
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isImpostor: boolean
  word: string
  startPlayerIndex: number
  showStartPlayer?: boolean
  showGameInfo?: boolean
  round?: number
  category?: string
}>()
</script>
