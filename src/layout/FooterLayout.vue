<template>
  <footer class="footer">
    <div class="footer-inner">

      <!-- Marque -->
      <div class="footer-brand">
        <img src="../assets/logo/1.png" alt="L'Atelier de Marie" class="footer-logo">
        <span class="footer-name">L'Atelier de Marie</span>
      </div>

      <!-- Séparateur vertical -->
      <div class="footer-sep"></div>

      <!-- Coordonnées -->
      <div class="footer-contact">
        <a href="tel:+33660535044" class="footer-link">
          <i class="pi pi-phone"></i> 06 60 53 50 44
        </a>
        <a href="https://maps.google.com/?q=19+Rue+Georges+Genevier+41300+Salbris" target="_blank" rel="noopener" class="footer-link">
          <i class="pi pi-map-marker"></i> 19 Rue Georges Genevier, Salbris
        </a>
      </div>

      <!-- Réseaux -->
      <div class="footer-social">
        <a href="https://www.facebook.com/people/LAtelier-de-Marie/61567138575765/" target="_blank" rel="noopener" aria-label="Facebook" class="social-link">
          <i class="pi pi-facebook"></i>
        </a>
        <a href="https://www.instagram.com/latelierdemarie41/" target="_blank" rel="noopener" aria-label="Instagram" class="social-link">
          <i class="pi pi-instagram"></i>
        </a>
      </div>

    </div>

    <div class="footer-bottom">
      <p>© {{ new Date().getFullYear() }} L'Atelier de Marie — Tous droits réservés</p>
      <nav class="footer-legal" aria-label="Informations légales">
        <router-link to="/mentions-legales">Mentions légales</router-link>
        <span aria-hidden="true">·</span>
        <router-link to="/politique-de-confidentialite">Politique de confidentialité</router-link>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.footer {
  background: var(--blush);
  border-top: 1px solid var(--border-color);
}

/* ── Bande principale compacte ── */
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 5%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px 32px;
}

/* Marque */
.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.footer-logo {
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  opacity: 0.85;
}
.footer-name {
  font-family: "Cormorant Garamond", serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-dark);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

/* Séparateur vertical */
.footer-sep {
  width: 1px;
  height: 28px;
  background: var(--border-strong);
  flex-shrink: 0;
  display: none;
}

/* Contact */
.footer-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  flex: 1;
  min-width: 0;
}
.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  color: var(--text-muted);
  text-decoration: none;
  letter-spacing: 0.03em;
  white-space: nowrap;
  transition: color 0.2s ease;
}
.footer-link:hover { color: var(--taupe); }
.footer-link .pi { font-size: 0.72rem; color: var(--taupe); opacity: 0.7; }

/* Réseaux */
.footer-social {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-strong);
  color: var(--text-muted);
  font-size: 0.85rem;
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}
.social-link:hover {
  color: var(--taupe);
  border-color: var(--taupe);
  background: rgba(174, 120, 112, 0.06);
}

/* Copyright */
.footer-bottom {
  border-top: 1px solid var(--border-color);
  padding: 12px 5%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.footer-bottom p {
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  opacity: 0.6;
}
.footer-legal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}
.footer-legal a {
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.footer-legal a:hover {
  color: var(--taupe);
}
.footer-legal span {
  color: var(--text-muted);
  opacity: 0.5;
}

/* ── Mobile : empilement vertical centré ── */
@media (max-width: 639px) {
  .footer-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    padding: 22px 5% 18px;
  }

  .footer-contact {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .footer-link {
    justify-content: center;
  }
}

/* Desktop */
@media (min-width: 640px) {
  .footer-sep { display: block; }
}
</style>
