<template>
  <LegalPage title="Mentions légales" updated-at="18 août 2026">
    <h2>1. Éditeur du site</h2>
    <p>
      Le site <strong>atelier-de-marie.com</strong> est édité par <strong>L'Atelier de Marie</strong>,
      institut de prothésie ongulaire / soins esthétiques.
    </p>
    <ul>
      <li>Adresse : 19 Rue Georges Genevier, 41300 Salbris</li>
      <li>Téléphone : 06 60 53 50 44</li>
      <li>Email : latelierdemarie41@outlook.com</li>
      <li>Responsable : Marie PACREAU</li>
      <li>Forme juridique : micro-entreprise</li>
      <li>SIRET : 88202812900022</li>
      <li>TVA intracommunautaire : FR59882028129</li>
    </ul>
    <p>
      Directrice de la publication : Marie PACREAU.
    </p>

    <h2>2. Hébergement</h2>
    <p>
      Le site et son back-office (<strong>backoffice.atelier-de-marie.com</strong>) sont hébergés
      par <strong>o2switch</strong>, Chemin des Pardiaux, 63000 Clermont-Ferrand, France,
      téléphone : 04 44 44 60 40, site :
      <a href="https://www.o2switch.fr" target="_blank" rel="noopener">www.o2switch.fr</a>.
    </p>

    <h2>3. Propriété intellectuelle</h2>
    <p>
      Les textes, photographies de présentation, logo et éléments graphiques du site sont protégés.
      Toute reproduction non autorisée est interdite.
    </p>

    <h2>4. Données personnelles</h2>
    <p>
      Le traitement des données personnelles est décrit dans la
      <router-link to="/politique-de-confidentialite">politique de confidentialité</router-link>.
    </p>

    <h2>5. Médiation de la consommation</h2>
    <p>
      Conformément aux articles L.611-1 et suivants du code de la consommation, la cliente
      peut recourir gratuitement à un médiateur de la consommation en cas de litige.
      Le médiateur n'est pas encore désigné à ce jour. Ses coordonnées seront publiées
      sur cette page dès désignation.
    </p>
  </LegalPage>
</template>

<script setup lang="ts">
import LegalPage from '@/components/LegalPage.vue'
</script>
