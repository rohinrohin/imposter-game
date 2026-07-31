<template>
  <div class="min-h-screen safe-page">
    <div class="mx-auto w-full max-w-2xl pt-10">
      <header class="animate-fade-up">
        <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-mint">
          <span class="h-2 w-2 rounded-full bg-mint"></span> Party Games
        </div>
        <h1 class="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">
          Pick a game.
        </h1>
        <p class="mt-3 text-mist">Quick, no-setup games to play with friends.</p>
      </header>

      <div class="mt-8 space-y-3">
        <router-link
          to="/imposter-game"
          class="group flex items-center gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-5 transition hover:border-mint/50 hover:bg-ink-800"
        >
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-mint-soft text-3xl">
            🕵️
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="font-display text-xl font-bold">Imposter</h2>
            <p class="truncate text-sm text-fog">Everyone gets the word. Except one.</p>
          </div>
          <span class="text-fog transition group-hover:translate-x-0.5 group-hover:text-mint">→</span>
        </router-link>

        <div class="flex items-center gap-4 rounded-2xl border border-dashed border-ink-700 p-5 opacity-60">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-3xl">
            🎲
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="font-display text-xl font-bold text-mist">More soon</h2>
            <p class="truncate text-sm text-fog">New games are on the way.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Games index — list of available party games.
</script>
