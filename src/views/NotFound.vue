<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'

const route = useRoute()

const currentPath = computed(() => {
  const query = new URLSearchParams(route.query as Record<string, string>).toString()
  const hash = typeof route.hash === 'string' ? route.hash : ''
  return `${route.path}${query ? `?${query}` : ''}${hash}`
})
</script>

<template>
  <section class="not-found-shell relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden px-6 py-12">
    <div class="not-found-ink not-found-ink-left" aria-hidden="true" />
    <div class="not-found-ink not-found-ink-right" aria-hidden="true" />

    <div class="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
      <p class="mb-6 text-sm tracking-[0.55em] text-muted-foreground/80">
        薨〇薨
      </p>

      <div class="hong-stage mb-8" aria-hidden="true">
        <span class="hong-glyph hong-glyph-shadow">薨</span>
        <span class="hong-glyph si-glyph">死</span>
        <span class="hong-glyph hong-top-glyph">薨</span>
      </div>

      <h1 class="mb-3 text-2xl font-semibold tracking-[0.15em] text-foreground sm:text-3xl">
        您好，您误入藕花深处了
      </h1>

      <p class="mb-8 text-sm text-muted-foreground sm:text-base">
        这里是
        <code class="rounded-md border bg-background/75 px-2 py-1 font-mono text-foreground">{{ currentPath }}</code>
      </p>

      <Button as-child size="lg" class="min-w-36">
        <RouterLink to="/">
          回到主页
        </RouterLink>
      </Button>
    </div>
  </section>
</template>

<style scoped>
.not-found-shell {
  background:
    radial-gradient(circle at top, color-mix(in oklch, var(--foreground) 8%, transparent), transparent 42%),
    linear-gradient(180deg, color-mix(in oklch, var(--muted) 70%, white), var(--background) 55%);
}

.not-found-ink {
  position: absolute;
  width: 18rem;
  height: 18rem;
  border-radius: 9999px;
  background:
    radial-gradient(circle, color-mix(in oklch, var(--foreground) 8%, transparent), transparent 68%);
  filter: blur(8px);
  opacity: 0.75;
}

.not-found-ink-left {
  top: 10%;
  left: -4rem;
}

.not-found-ink-right {
  right: -5rem;
  bottom: 6%;
}

.hong-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: min(58vw, 18rem);
  aspect-ratio: 1;
}

.hong-glyph {
  grid-area: 1 / 1;
  font-family: 'Noto Serif SC', 'Noto Serif', serif;
  font-size: clamp(7rem, 22vw, 14rem);
  line-height: 1;
  user-select: none;
}

.hong-glyph-main {
  color: color-mix(in oklch, var(--foreground) 92%, black);
}

.hong-glyph-shadow {
  color: color-mix(in oklch, var(--foreground) 12%, transparent);
  transform: translateY(0.6rem) scale(1.08);
  filter: blur(10px);
  animation: hong-shadow-enter 1100ms ease-out both;
}

.si-glyph {
  color: color-mix(in oklch, var(--foreground) 92%, black);
  transform-origin: center 72%;
  animation: si-enter 900ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
}

.hong-top-glyph {
  color: color-mix(in oklch, var(--foreground) 92%, black);
  clip-path: inset(0 0 47% 0);
  animation: hong-top-enter 900ms cubic-bezier(0.2, 0.9, 0.2, 1) 220ms both;
}

@keyframes si-enter {
  from {
    opacity: 0;
    transform: translateY(1.7rem) scale(0.58, 0.3);
    letter-spacing: 0.3em;
  }

  72% {
    opacity: 1;
    transform: translateY(1.22rem) scale(1.05, 0.54);
    letter-spacing: 0;
  }

  to {
    opacity: 1;
    transform: translateY(1.28rem) scale(1, 0.52);
    letter-spacing: 0;
  }
}

@keyframes hong-top-enter {
  from {
    opacity: 0;
    transform: translateY(-0.9rem) scale(0.82);
    filter: blur(6px);
  }

  70% {
    opacity: 1;
    transform: translateY(0.08rem) scale(1.03);
    filter: blur(0);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes hong-shadow-enter {
  from {
    opacity: 0;
    transform: translateY(1rem) scale(0.78);
  }

  to {
    opacity: 1;
    transform: translateY(0.6rem) scale(1.08);
  }
}
</style>
