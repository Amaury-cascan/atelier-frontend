<template>
  <!-- ── Hero plein écran ── -->
  <section class="hero">
    <div class="hero-visual">
      <img src="../../assets/pictures/atelier.jpg" alt="L'Atelier de Marie">
      <div class="hero-overlay"></div>
    </div>
    <div class="hero-content">
      <p class="hero-eyebrow">Bienvenue à</p>
      <h1 class="hero-title">L'Atelier de Marie</h1>
      <p class="hero-tagline">Votre salon de beauté au cœur de la Sologne</p>
      <p class="hero-desc">
        Ici, chaque cliente est traitée avec soin et attention,
        dans un univers chaleureux et cosy où votre beauté est notre priorité.
      </p>
      <button @click="scrollToBooking" class="hero-cta">Prendre rendez-vous</button>
    </div>
  </section>

  <!-- ── Bandeau citation ── -->
  <div class="intro-strip">
    <p class="intro-text">
      <a @click="scrollToBooking" class="intro-link">Découvrir nos prestations</a>
    </p>
  </div>
</template>

<script setup lang="ts">
const scrollToBooking = () => {
  const el = document.getElementById('booking');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>

<style scoped>
/* ─────────────────────────────────────────────
   Hero
───────────────────────────────────────────── */
.hero {
  position: relative;
  width: 100%;
  height: 72vh;
  min-height: 460px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-visual {
  position: absolute;
  inset: 0;
}

.hero-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    155deg,
    rgba(44, 36, 34, 0.62) 0%,
    rgba(166, 124, 136, 0.38) 100%
  );
}

/* ─────────────────────────────────────────────
   Contenu hero
───────────────────────────────────────────── */
.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 24px;
  max-width: 680px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.hero-eyebrow {
  font-family: 'Tangerine', cursive;
  font-size: 2.6rem;
  font-weight: 400;
  opacity: 0.92;
  letter-spacing: 0.04em;
  margin-bottom: -0.4rem;
  line-height: 1;
}

.hero-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(2.6rem, 9vw, 5.2rem);
  font-weight: 300;
  letter-spacing: 0.08em;
  color: white;
  line-height: 1.08;
  margin-bottom: 1.2rem;
}

.hero-tagline {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: 1rem;
}

.hero-desc {
  font-size: 0.9rem;
  line-height: 1.75;
  opacity: 0.75;
  font-style: italic;
  margin-bottom: 2.2rem;
  max-width: 520px;
}

.hero-cta {
  display: inline-block;
  background: transparent;
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.65);
  padding: 14px 40px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.hero-cta:hover {
  background: white;
  color: var(--text-dark);
  border-color: white;
}

/* ─────────────────────────────────────────────
   Bandeau intro
───────────────────────────────────────────── */
.intro-strip {
  background-color: var(--blush);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 14px 24px;
  text-align: center;
}

.intro-text {
  font-size: 0.82rem;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  font-style: italic;
}

.intro-link {
  color: var(--taupe);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  font-style: normal;
  font-weight: 500;
  transition: color 0.2s ease;
}

.intro-link:hover {
  color: var(--taupe-dark);
}

/* ─────────────────────────────────────────────
   Responsive
───────────────────────────────────────────── */
@media (min-width: 760px) {
  .hero {
    height: 88vh;
    min-height: 580px;
  }

  .hero-eyebrow {
    font-size: 3.6rem;
  }

  .intro-strip {
    padding: 16px 24px;
  }

  .intro-text {
    font-size: 0.88rem;
  }
}
</style>
