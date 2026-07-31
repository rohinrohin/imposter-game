<template>
  <div class="card p-6 text-center">
    <p class="label">Room code</p>
    <div class="mt-2 font-display text-5xl font-bold tracking-[0.3em] text-snow sm:text-6xl">
      {{ code }}
    </div>

    <div class="mt-5 flex flex-wrap justify-center gap-2">
      <button class="btn-secondary flex-1 min-w-[8rem]" @click="copyCode">
        {{ copiedCode ? '✓ Copied' : 'Copy code' }}
      </button>
      <button class="btn-primary flex-1 min-w-[8rem]" @click="share">
        {{ sharedOrCopied ? '✓ Link copied' : 'Share link' }}
      </button>
    </div>

    <button class="btn-ghost mt-2 w-full text-sm" @click="showQr = !showQr">
      {{ showQr ? 'Hide QR code' : 'Show QR code' }}
    </button>

    <div v-if="showQr" class="mt-4 flex flex-col items-center gap-2 animate-fade-up">
      <QrCode :value="joinUrl" />
      <p class="max-w-xs break-all text-xs text-fog">{{ joinUrl }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import QrCode from './QrCode.vue'

const props = defineProps<{ code: string }>()

const showQr = ref(false)
const copiedCode = ref(false)
const sharedOrCopied = ref(false)

const joinUrl = computed(() => `${location.origin}/imposter-game?room=${props.code}`)

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}

async function copyCode() {
  if (await copyText(props.code)) {
    copiedCode.value = true
    setTimeout(() => (copiedCode.value = false), 1600)
  }
}

async function share() {
  const shareData = {
    title: 'Imposter',
    text: `Join my Imposter game — code ${props.code}`,
    url: joinUrl.value,
  }
  if (navigator.share) {
    try {
      await navigator.share(shareData)
      return
    } catch {
      // user cancelled or unsupported — fall through to copy
    }
  }
  if (await copyText(joinUrl.value)) {
    sharedOrCopied.value = true
    setTimeout(() => (sharedOrCopied.value = false), 1600)
  }
}
</script>
