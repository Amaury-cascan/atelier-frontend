<template>
  <article class="legal-page">
    <header class="legal-header">
      <p class="legal-eyebrow">Informations</p>
      <h1 class="legal-title">{{ title }}</h1>
      <p class="legal-updated">Dernière mise à jour : {{ updatedAt }}</p>
    </header>
    <div class="legal-body">
      <slot />
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  updatedAt: string
}>()
</script>

<style scoped>
.legal-page {
  flex: 1;
  max-width: 760px;
  margin: 0 auto;
  padding: 48px 20px 72px;
  color: var(--text-dark);
}

.legal-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--border-color);
}

.legal-eyebrow {
  font-family: 'Tangerine', cursive;
  font-size: 2.2rem;
  color: var(--taupe);
  line-height: 1;
  margin-bottom: -4px;
}

.legal-title {
  font-family: "Cormorant Garamond", serif;
  font-size: 2.2rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--text-dark);
}

.legal-updated {
  margin-top: 12px;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.legal-body {
  line-height: 1.7;
}

.legal-body :deep(h2) {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.35rem;
  font-weight: 500;
  color: var(--text-dark);
  margin: 2em 0 0.7em;
}

.legal-body :deep(p) {
  font-size: 0.92rem;
  color: var(--text-dark);
  margin-bottom: 0.9em;
}

.legal-body :deep(ul) {
  padding-left: 1.2em;
  list-style: disc;
  margin: 0.3em 0 1.1em;
}

.legal-body :deep(li) {
  font-size: 0.92rem;
  margin-bottom: 0.35em;
}

.legal-body :deep(a) {
  color: var(--taupe);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.legal-body :deep(a:hover) {
  color: var(--taupe-dark);
}

@media (min-width: 480px) {
  .legal-page {
    padding: 64px 24px 88px;
  }
}
</style>
