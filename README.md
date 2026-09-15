# JAE Ministries — Site de recueil de témoignages

Site 100 % fonctionnel permettant à n'importe qui de soumettre un témoignage,
et à un unique administrateur (`jaeweb001@gmail.com`) de consulter les
témoignages reçus, classés par jour, sur les 20 derniers jours. Passé ce
délai, les témoignages sont automatiquement et définitivement supprimés.

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
├── scripts/cleanup.js         → purge automatique quotidienne (20 jours)
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

Une fois ces deux étapes faites, le site fonctionne immédiatement — il n'y a
rien d'autre à configurer.

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

## 4. Purge automatique des témoignages après 20 jours

Deux mécanismes se complètent :

- **À chaque connexion de l'admin**, le tableau de bord supprime
  immédiatement tout témoignage plus vieux que 20 jours avant d'afficher la liste.
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
  (obligatoire), texte du témoignage (obligatoire, 5000 mots maximum avec
  compteur en temps réel).
- À l'envoi, un message de remerciement chrétien s'affiche.

**Espace admin (`admin.html`)**
- Connexion strictement réservée à `jaeweb001@gmail.com` (toute autre
  tentative, même avec un compte Firebase valide, est refusée et déconnectée).
- Affiche les témoignages des **20 derniers jours**, regroupés par jour, du
  plus récent au plus ancien, et numérotés dans l'ordre d'arrivée à
  l'intérieur de chaque journée (N°1, N°2, N°3…).
- Un bandeau de statistiques indique le nombre de témoignages du jour, le
  total sur 20 jours et le nombre de jours représentés.
