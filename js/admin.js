// Admin Dashboard - JAE Ministries

const ADMIN_EMAIL = 'jaeweb001@gmail.com';
const MAX_DAYS = 20;

document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');
  const btnLogout = document.getElementById('btn-logout');
  const btnRefresh = document.getElementById('btn-refresh');
  const listEl = document.getElementById('temoignages-list');
  const countBadge = document.getElementById('count-badge');

  auth.onAuthStateChanged(async (user) => {
    if (user && user.email === ADMIN_EMAIL) {
      loginScreen.hidden = true;
      dashboard.hidden = false;
      await loadData();
    } else {
      if (user) await auth.signOut();
      loginScreen.hidden = false;
      dashboard.hidden = true;
    }
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.hidden = true;

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    if (email !== ADMIN_EMAIL) {
      loginError.textContent = 'Cet email n’est pas autorisé.';
      loginError.hidden = false;
      return;
    }

    loginBtn.disabled = true;
    loginBtn.querySelector('.btn-text').hidden = true;
    loginBtn.querySelector('.btn-loading').hidden = false;

    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      let msg = 'Email ou mot de passe incorrect.';
      if (err.code === 'auth/user-not-found') msg = 'Aucun compte trouvé.';
      if (err.code === 'auth/wrong-password') msg = 'Mot de passe incorrect.';
      if (err.code === 'auth/too-many-requests') msg = 'Trop de tentatives. Réessayez plus tard.';
      loginError.textContent = msg;
      loginError.hidden = false;
    } finally {
      loginBtn.disabled = false;
      loginBtn.querySelector('.btn-text').hidden = false;
      loginBtn.querySelector('.btn-loading').hidden = true;
    }
  });

  btnLogout.addEventListener('click', () => auth.signOut());
  btnRefresh.addEventListener('click', () => loadData());

  async function loadData() {
    listEl.innerHTML = '<div class="loading">Chargement des témoignages...</div>';

    try {
      // Nettoyage des témoignages > 20 jours
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - MAX_DAYS);

      const oldSnap = await db.collection('temoignages')
        .where('createdAt', '<', cutoff)
        .get();

      if (!oldSnap.empty) {
        const batch = db.batch();
        oldSnap.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      }

      // Récupérer les témoignages restants
      const snapshot = await db.collection('temoignages')
        .orderBy('ordre', 'desc')
        .get();

      const temoignages = [];
      const todayStr = new Date().toISOString().slice(0, 10);
      let total = 0, today = 0, hommes = 0, femmes = 0;

      snapshot.forEach(doc => {
        const d = doc.data();
        const created = d.createdAt?.toDate ? d.createdAt.toDate() : new Date();
        temoignages.push({
          ordre: d.ordre,
          nom: d.nom || 'Anonyme',
          whatsapp: d.whatsapp || '—',
          genre: d.genre,
          temoignage: d.temoignage,
          date: created
        });
        total++;
        if (d.genre === 'homme') hommes++;
        if (d.genre === 'femme') femmes++;
        if (created.toISOString().slice(0, 10) === todayStr) today++;
      });

      document.getElementById('stat-total').textContent = total;
      document.getElementById('stat-today').textContent = today;
      document.getElementById('stat-hommes').textContent = hommes;
      document.getElementById('stat-femmes').textContent = femmes;

      if (temoignages.length === 0) {
        listEl.innerHTML = '<div class="empty">Aucun témoignage pour le moment.<br>Les témoignages de plus de 20 jours sont automatiquement supprimés.</div>';
        countBadge.textContent = '0 témoignage';
        return;
      }

      countBadge.textContent = total + (total > 1 ? ' témoignages' : ' témoignage');

      listEl.innerHTML = temoignages.map(t => {
        const dateStr = t.date.toLocaleString('fr-FR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
        return `
          <article class="temoignage-card">
            <div class="temoignage-header">
              <div class="temoignage-meta">
                <span><strong>N° ${t.ordre}</strong></span>
                <span>Nom : <strong>${esc(t.nom)}</strong></span>
                <span>WhatsApp : <strong>${esc(t.whatsapp)}</strong></span>
                <span class="genre-tag genre-${t.genre}">${t.genre === 'homme' ? 'Homme' : 'Femme'}</span>
              </div>
              <span class="ordre-badge">#${t.ordre}</span>
            </div>
            <div class="temoignage-body">${esc(t.temoignage)}</div>
            <div class="temoignage-date">Reçu le ${dateStr}</div>
          </article>`;
      }).join('');

    } catch (err) {
      console.error(err);
      if (err.code === 'permission-denied') {
        listEl.innerHTML = '<div class="empty">Accès refusé. Reconnectez-vous.</div>';
        auth.signOut();
      } else {
        listEl.innerHTML = '<div class="empty">Erreur de chargement. Actualisez.</div>';
      }
    }
  }

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});
