# JAE Ministries — Site de recueil de témoignages

Site 100 % fonctionnel permettant à n'importe qui de soumettre un témoignage
en **texte ou en audio** (10 minutes maximum), et à un unique
administrateur (`jaeweb001@gmail.com`) de consulter les témoignages reçus,
classés par jour, sur les 60 derniers jours (35 jours s'ils ont été
partagés sur WhatsApp). Passé ce délai, les témoignages sont
automatiquement et définitivement supprimés du site — jamais de WhatsApp.

**Le logo est intégré directement dans le code des pages** (encodé en
base64) : il s'affichera toujours, même si un fichier est mal placé — plus
aucun risque d'image cassée.

---

## 1. Ce que contient le dossier

```
jae-ministries/
├── index.html                → page publique : entièrement autonome
│                                (logo + design + connexion Firebase + tout le code)
├── admin.html                 → espace administrateur : entièrement autonome
├── firestore.rules            → règles de sécurité à coller dans la console Firebase
├── scripts/cleanup.js         → purge automatique quotidienne (60 jours)
├── package.json
└── .github/workflows/cleanup.yml → tâche planifiée gratuite (GitHub Actions)
```

`index.html` et `admin.html` ne dépendent d'aucun autre fichier du dossier
(pas de `style.css`, pas de `app.js`, pas d'image externe) : tout est inclus
dans le fichier lui-même. C'est volontaire — c'est ce qui empêche les
problèmes de chemins cassés que tu as rencontrés (logo qui ne s'affiche pas,
page sans mise en forme, boutons qui ne répondent pas).

La configuration Firebase du projet **`jaetemoignage`** est déjà intégrée
dans les deux fichiers. Tu n'as rien à modifier dans le code.

---

## 2. Ce qu'il reste à activer dans Firebase (obligatoire)

Le code est prêt, mais Firebase a besoin que deux services soient activés
pour fonctionner. Va sur
[console.firebase.google.com](https://console.firebase.google.com), ouvre le
projet **jaetemoignage**.

### 2.1 Activer Firestore (la base de données)

1. Menu de gauche : **Build > Firestore Database**.
2. Clique sur **Créer une base de données**.
3. Choisis **Mode production**, puis une région proche de toi. Valide.
4. Va dans l'onglet **Règles**, efface tout le contenu, et colle exactement
   le contenu du fichier `firestore.rules` fourni ici. Clique sur **Publier**.

*(Si tu sautes cette étape : l'envoi du formulaire et l'espace admin
afficheront un message d'erreur clair à l'écran, au lieu de rester
silencieusement bloqués.)*

### 2.2 Activer l'authentification (pour l'espace admin)

1. Menu de gauche : **Build > Authentication**.
2. Clique sur **Get started**.
3. Onglet **Sign-in method** → active **E-mail/Mot de passe**.
4. Onglet **Users** → **Ajouter un utilisateur** → crée le compte avec
   l'adresse **jaeweb001@gmail.com** et le mot de passe de ton choix.
   C'est le seul compte autorisé à se connecter à l'espace admin, quoi
   qu'il arrive.

Une fois ces deux étapes faites, le site fonctionne immédiatement pour les
témoignages en **texte**. Pour les témoignages **audio**, une troisième
étape est nécessaire (section 2.3 ci-dessous).

### 2.3 Créer un compte Cloudinary gratuit (pour les témoignages audio)

Firebase ne permet plus de stocker des fichiers gratuitement sans carte
bancaire — c'est pour ça que les audios sont hébergés sur **Cloudinary**, un
service séparé dont le plan gratuit (25 Go/mois) ne demande aucune carte.

1. Va sur [cloudinary.com](https://cloudinary.com) et crée un compte gratuit.
2. Une fois connecté, tu arrives sur le tableau de bord. Note le **Cloud
   name** affiché en haut de la page (un identifiant court, par exemple
   `djae1234`).
3. Clique sur l'icône ⚙️ (Paramètres) > onglet **Upload**.
4. Descends jusqu'à **Upload presets**, clique sur **Add upload preset**.
5. Règle **Signing Mode** sur **Unsigned** (obligatoire — c'est ce qui
   permet au site d'envoyer l'audio sans exposer de mot de passe).
6. Toujours dans ce preset, sous **Media analysis and AI / Restrictions**
   (ou une section équivalente selon l'interface) :
   - Limite les formats autorisés à de l'audio : `webm, mp3, m4a, ogg, wav, aac`.
   - Limite la taille de fichier maximale à environ **15 Mo** (largement
     suffisant pour 10 minutes d'audio).
7. Sauvegarde, puis note le **nom du preset** (généré automatiquement, ou
   personnalisé si tu en as choisi un).
8. Ouvre `index.html`, repère les deux lignes suivantes (recherche
   `REMPLACE_MOI`) et remplace-les par tes deux valeurs :

```js
const CLOUDINARY_CLOUD_NAME = "REMPLACE_MOI";      // ton Cloud name
const CLOUDINARY_UPLOAD_PRESET = "REMPLACE_MOI";   // ton preset unsigned
```

9. Remets ce fichier `index.html` modifié en ligne sur GitHub.

Tant que ces deux valeurs ne sont pas remplacées, l'onglet "Audio" du
formulaire reste visible mais affiche un message clair expliquant que
l'envoi audio n'est pas encore configuré — le reste du site (texte)
continue de fonctionner normalement.

---

## 3. Mettre le site en ligne avec GitHub Pages (gratuit)

1. Crée un dépôt sur [github.com](https://github.com) (par exemple `jae-ministries`), ou utilise un dépôt existant.
2. **Supprime les anciens fichiers** si tu avais déjà mis une version précédente du site dans ce dépôt (pour éviter tout mélange), puis ajoute-y exactement les fichiers de ce dossier, en gardant la structure (notamment le dossier `.github/`).
3. Dans le dépôt : **Settings > Pages**.
4. Sous **Source**, choisis **Deploy from a branch**, branche `main`, dossier `/ (root)`. Enregistre.
5. Attends une à deux minutes, puis ouvre l'adresse de ton site. Si c'est un
   dépôt classique, l'adresse est du type
   `https://ton-nom-utilisateur.github.io/nom-du-depot/`. Si c'est un dépôt
   spécial nommé exactement `ton-nom-utilisateur.github.io`, l'adresse est
   directement `https://ton-nom-utilisateur.github.io/` — dans ce cas les
   fichiers doivent être **à la racine** du dépôt (pas dans un sous-dossier).
6. **Vide le cache de ton navigateur** ou ouvre le site en navigation privée
   avant de tester, pour être sûr de ne pas voir une ancienne version
   enregistrée.

L'espace admin est accessible via `.../admin.html` (aussi accessible par un
petit lien discret en bas de la page d'accueil).

---

## 4. Purge automatique des témoignages (60 jours, ou 35 jours si partagés)

Deux durées de conservation coexistent :

- **Témoignage jamais partagé sur WhatsApp** → supprimé après **60 jours**.
- **Témoignage déjà partagé sur WhatsApp** (voir section 7 ci-dessous) →
  supprimé après **35 jours à partir de la date de partage**, puisqu'il est
  déjà sauvegardé dans le groupe WhatsApp. Cette suppression n'a aucun effet
  sur WhatsApp lui-même : le message reste dans le groupe, seule la copie
  sur le site et dans la base de données disparaît.

Deux mécanismes se complètent pour appliquer cette purge :

- **À chaque connexion de l'admin**, le tableau de bord supprime
  immédiatement tout témoignage expiré avant d'afficher la liste.
- **Chaque jour, automatiquement**, même si l'admin ne se connecte pas, une
  tâche planifiée gratuite sur GitHub Actions supprime les témoignages
  expirés.

Pour activer cette tâche automatique (facultatif mais recommandé) :

1. Console Firebase : ⚙️ **Paramètres du projet > Comptes de service**.
2. **Générer une nouvelle clé privée** → un fichier `.json` est téléchargé.
   Garde-le secret, ne le mets jamais dans le dépôt GitHub.
3. Ouvre ce fichier, copie tout son contenu.
4. Sur GitHub, dans ton dépôt : **Settings > Secrets and variables > Actions > New repository secret**.
   - Nom : `FIREBASE_SERVICE_ACCOUNT`
   - Valeur : colle le contenu du fichier `.json`
5. Enregistre. La purge tournera automatiquement chaque jour à 3h du matin
   (UTC). Tu peux aussi la lancer manuellement depuis l'onglet **Actions**
   du dépôt (bouton **Run workflow**).

Sans cette étape, le site fonctionne quand même normalement — la purge se
fera simplement à chaque connexion de l'admin plutôt que tous les jours.

---

## 5. Si quelque chose ne fonctionne toujours pas

Avec cette version, plus aucun bug ne devrait venir d'un fichier manquant ou
mal placé (tout est dans `index.html` et `admin.html`). S'il reste un souci,
c'est presque toujours l'étape 2 (Firestore ou Authentication pas encore
activés) — et le site te l'indiquera maintenant directement à l'écran par un
message d'erreur explicite, au lieu de rester silencieux :

- Sur la page d'accueil, un bandeau rouge apparaît si Firebase ne répond pas.
- Dans le formulaire, un message précis s'affiche si l'envoi est refusé.
- Sur la page de connexion admin, le message indique si c'est
  l'authentification qui n'est pas activée, si le compte n'existe pas, ou si
  le mot de passe est incorrect.

Pour un diagnostic encore plus précis : ouvre le site, appuie sur **F12**
(ou fais un appui long puis "Inspecter" sur mobile) pour ouvrir les outils de
développement, onglet **Console** — les erreurs y sont détaillées.

---

## 6. Fonctionnement du site, en résumé

**Page publique (`index.html`)**
- Bouton **« Je donne mon témoignage »** → ouvre le formulaire.
- Champs : nom et prénom (facultatif), numéro WhatsApp (facultatif), genre
  (obligatoire).
- Le témoignage peut être envoyé en **texte** (10 000 mots maximum, compteur
  en temps réel) ou en **audio** (enregistré directement dans le
  navigateur, 10 minutes maximum, arrêt automatique une fois la limite
  atteinte).
- À l'envoi, un message de remerciement chrétien s'affiche.

**Espace admin (`admin.html`)**
- Connexion strictement réservée à `jaeweb001@gmail.com` (toute autre
  tentative, même avec un compte Firebase valide, est refusée et déconnectée).
- Affiche les témoignages des **60 derniers jours** (ou moins s'ils ont été
  partagés sur WhatsApp, voir section 7), regroupés par jour, du plus
  récent au plus ancien, et numérotés dans l'ordre d'arrivée à l'intérieur
  de chaque journée (N°1, N°2, N°3…).
- Les témoignages audio s'écoutent directement depuis une carte dédiée.
- Un bandeau de statistiques indique le nombre de témoignages du jour, le
  total sur la période et le nombre de jours représentés.

---

## 7. Partager un témoignage dans ton groupe WhatsApp

Il n'existe pas de moyen gratuit et fiable d'envoyer un témoignage
**automatiquement** dans un groupe WhatsApp dès sa réception (l'API
officielle de WhatsApp ne le permet pas, et les solutions non-officielles
risquent de faire bannir ton numéro). Le site propose donc la meilleure
alternative gratuite et sans risque :

1. Dans l'espace admin, chaque témoignage a un bouton **« 📤 Partager sur
   WhatsApp »**.
2. En appuyant dessus, WhatsApp s'ouvre avec le message déjà rédigé (texte
   du témoignage, ou lien de l'audio) — il ne te reste qu'à choisir ton
   groupe dans la liste de tes discussions WhatsApp et à appuyer sur
   envoyer.
3. Le témoignage est alors marqué **« ✓ Partagé »** dans le tableau de
   bord, et sa durée de conservation sur le site passe automatiquement de
   60 à **35 jours** (voir section 4). Un clic sur *« ↩ Annuler le
   partage »* permet de revenir en arrière en cas d'erreur.

Cette suppression après 35 jours ne concerne que le site et la base de
données : le message reste disponible dans ton groupe WhatsApp comme
n'importe quel autre message, indéfiniment (selon les réglages de ton
groupe).
