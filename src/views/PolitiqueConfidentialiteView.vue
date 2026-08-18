<template>
  <LegalPage title="Politique de confidentialité" updated-at="18 août 2026">
    <p>
      Cette politique informe les clientes et visiteuses du site
      <strong>atelier-de-marie.com</strong> sur les traitements de données personnelles
      réalisés par L'Atelier de Marie, conformément au RGPD et à la loi Informatique et Libertés.
    </p>

    <h2>1. Responsable du traitement</h2>
    <ul>
      <li>L'Atelier de Marie</li>
      <li>Responsable : Marie PACREAU</li>
      <li>Forme juridique : micro-entreprise</li>
      <li>19 Rue Georges Genevier, 41300 Salbris</li>
      <li>06 60 53 50 44 — latelierdemarie41@outlook.com</li>
      <li>SIRET : 88202812900022</li>
    </ul>
    <p>
      Aucun délégué à la protection des données n'est désigné. Pour toute question,
      contactez le salon aux coordonnées ci-dessus.
    </p>

    <h2>2. Données collectées</h2>
    <p>Lors de la création d'un compte et de la prise de rendez-vous en ligne :</p>
    <ul>
      <li>identité : nom, prénom ;</li>
      <li>contact : email, numéro de téléphone ;</li>
      <li>données de compte : mot de passe (stocké sous forme hachée), historique de rendez-vous.</li>
    </ul>
    <p>
      Le salon ne constitue pas de dossier photos ni de fiche de suivi
      (état des ongles, notes, allergies). Ces informations ne sont pas enregistrées dans l'application.
    </p>
    <p>
      Les journaux techniques du site (adresse IP, date de connexion) peuvent être
      enregistrés par l'hébergeur à des fins de sécurité.
    </p>

    <h2>3. Finalités et bases légales</h2>
    <ul>
      <li><strong>Compte et rendez-vous</strong> : exécution du contrat (article 6.1.b du RGPD).</li>
      <li><strong>Emails de confirmation, rappel la veille, réinitialisation du mot de passe</strong> :
        contrat et intérêt légitime (articles 6.1.b et 6.1.f).</li>
      <li><strong>Statistiques d'activité (chiffre d'affaires agrégé)</strong> : intérêt légitime (article 6.1.f).</li>
      <li><strong>Sécurité du site</strong> : intérêt légitime (article 6.1.f).</li>
    </ul>
    <p>Le salon n'envoie pas de newsletter commerciale.</p>

    <h2>4. Destinataires</h2>
    <p>Les données sont destinées à :</p>
    <ul>
      <li>la responsable de L'Atelier de Marie ;</li>
      <li>o2switch, hébergeur du site et de la base de données ;</li>
      <li>Mailjet (Sinch), pour l'envoi des emails transactionnels.</li>
    </ul>
    <p>
      Elles ne sont pas vendues à des tiers. Le site a été réalisé avec l'aide du conjoint
      de la responsable : il n'agit pas comme prestataire indépendant, mais sous l'autorité
      du salon (article 29 du RGPD). Aucun contrat de sous-traitance n'est requis à ce titre.
    </p>

    <h2>5. Transferts hors Union européenne</h2>
    <p>
      Les emails professionnels peuvent transiter par des messageries dont les serveurs
      se situent hors UE. Mailjet traite principalement les envois depuis l'Union européenne.
      Les polices du site sont auto-hébergées : aucune requête Google Fonts n'est effectuée.
    </p>

    <h2>6. Durées de conservation</h2>
    <ul>
      <li>Compte cliente : durée de la relation commerciale, puis 3 ans après le dernier rendez-vous.</li>
      <li>Rendez-vous ayant une utilité comptable : jusqu'à 10 ans (code de commerce).</li>
      <li>Jeton de réinitialisation du mot de passe : 1 heure.</li>
      <li>Journaux techniques : 6 mois.</li>
    </ul>

    <h2>7. Vos droits</h2>
    <p>
      Vous pouvez demander l'accès, la rectification, l'effacement, la limitation,
      la portabilité de vos données, ou vous opposer à un traitement fondé sur l'intérêt légitime.
    </p>
    <p>
      Pour exercer vos droits : <strong>latelierdemarie41@outlook.com</strong>
      ou au salon. Une réponse est apportée dans un délai d'un mois.
      Vous pouvez également introduire une réclamation auprès de la CNIL
      (<a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>).
    </p>

    <h2>8. Cookies et stockage local</h2>
    <p>
      Le site n'utilise pas de publicité ni d'outil de mesure d'audience.
      Après connexion, un jeton d'authentification et des informations de profil
      (nom, prénom, email) sont enregistrés dans le navigateur (stockage local)
      pour maintenir la session. Ils sont effacés à la déconnexion.
      Ces traceurs sont nécessaires au service demandé. Aucun bandeau cookies n'est requis
      à ce jour, faute de traceurs publicitaires ou de mesure d'audience.
    </p>

    <h2>9. Sécurité</h2>
    <p>
      Le mot de passe est stocké sous forme hachée. L'accès au back-office est
      réservé aux comptes administrateurs. Les accès API sont protégés par authentification,
      et les règles CORS sont limitées au domaine du site.
    </p>
  </LegalPage>
</template>

<script setup lang="ts">
import LegalPage from '@/components/LegalPage.vue'
</script>
