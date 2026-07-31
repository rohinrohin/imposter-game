<template>
  <div class="rounded-xl bg-snow p-3">
    <div class="h-44 w-44 [&>svg]:block [&>svg]:h-full [&>svg]:w-full" v-html="svg"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import qrcode from 'qrcode-generator'

const props = defineProps<{ value: string }>()

const svg = computed(() => {
  const qr = qrcode(0, 'M')
  qr.addData(props.value)
  qr.make()
  // scalable => the <svg> uses a viewBox with no fixed px size, so it fills the
  // sized 176px box above (a plain sized svg otherwise collapses to nothing).
  return qr.createSvgTag({ margin: 0, scalable: true })
})
</script>
