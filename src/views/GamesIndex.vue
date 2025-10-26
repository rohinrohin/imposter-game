<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4">
    <div class="mx-auto max-w-6xl py-12">
      <!-- Header -->
      <div class="text-center mb-16 fade-in">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-4">
          🎮 Party Games
        </h1>
        <p class="text-xl md:text-2xl text-blue-100">
          Choose a game to play with friends
        </p>
      </div>

      <!-- Games Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Imposter Game Card -->
        <router-link
          to="/imposter-game"
          class="group bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-white/40 hover:shadow-2xl"
        >
          <div class="text-center">
            <div class="text-6xl md:text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">
              🕵️
            </div>
            <h2 class="text-3xl font-bold text-white mb-4">
              Imposter Game
            </h2>
            <p class="text-blue-100 mb-6">
              Find the imposter who doesn't know the secret word!
            </p>
            <div class="flex flex-wrap gap-2 justify-center mb-4">
              <span class="bg-blue-500/30 text-blue-100 px-3 py-1 rounded-full text-sm">
                3-20 Players
              </span>
              <span class="bg-purple-500/30 text-purple-100 px-3 py-1 rounded-full text-sm">
                15 Categories
              </span>
              <span class="bg-pink-500/30 text-pink-100 px-3 py-1 rounded-full text-sm">
                Multiplayer
              </span>
            </div>
            <div class="text-white font-semibold group-hover:text-yellow-200 transition-colors duration-300">
              Play Now →
            </div>
          </div>
        </router-link>

        <!-- Coming Soon Cards -->
        <div class="bg-white/5 backdrop-blur-sm border-2 border-white/10 border-dashed rounded-3xl p-8 flex items-center justify-center">
          <div class="text-center">
            <div class="text-5xl mb-4 opacity-50">🎯</div>
            <h3 class="text-2xl font-bold text-white/50 mb-2">Coming Soon</h3>
            <p class="text-white/40">More games on the way!</p>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm border-2 border-white/10 border-dashed rounded-3xl p-8 flex items-center justify-center">
          <div class="text-center">
            <div class="text-5xl mb-4 opacity-50">🎲</div>
            <h3 class="text-2xl font-bold text-white/50 mb-2">Coming Soon</h3>
            <p class="text-white/40">More games on the way!</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center text-white/60 text-sm py-8 mt-16">
        <p>🎉 Have fun playing party games with friends!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Games index page - shows all available games
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.6s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
