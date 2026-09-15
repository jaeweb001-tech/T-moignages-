document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('temoignage-form');
  const textarea = document.getElementById('temoignage');
  const wordCountEl = document.getElementById('word-count');
  const thankYou = document.getElementById('thank-you');
  const submitBtn = document.getElementById('submit-btn');
  const btnNew = document.getElementById('btn-new');

  // Compteur de mots en direct
  function countWords(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(function(w){ return w.length > 0; }).length;
  }

  if (textarea && wordCountEl) {
    textarea.addEventListener('input', function () {
      wordCountEl.textContent = countWords(textarea.value);
    });
  }

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const genreInput = form.querySelector('input[name="genre"]:checked');
      if (!genreInput) {
        alert('Veuillez sélectionner votre genre (Homme ou Femme).');
        return;
      }

      const temoignage = textarea.value.trim();
      if (!temoignage) {
        alert('Veuillez écrire votre témoignage.');
        return;
      }

      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      if (btnText) btnText.hidden = true;
      if (btnLoading) btnLoading.hidden = false;

      try {
        if (typeof db === 'undefined') {
          throw new Error('Firebase non chargé. Vérifie firebase-config.js');
        }

        // Numéro d'ordre
        const compteurRef = db.collection('compteurs').doc('ordre');
        let nouvelOrdre = 1;

        await db.runTransaction(async function (transaction) {
          const doc = await transaction.get(compteurRef);
          if (doc.exists) {
            nouvelOrdre = (doc.data().valeur || 0) + 1;
          }
          transaction.set(compteurRef, { valeur: nouvelOrdre }, { merge: true });
        });

        // Enregistrer le témoignage
        await db.collection('temoignages').add({
          ordre: nouvelOrdre,
          genre: genreInput.value,
          temoignage: temoignage,
          nom: document.getElementById('nom').value.trim() || null,
          whatsapp: document.getElementById('whatsapp').value.trim() || null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Afficher le message de remerciement
        form.hidden = true;
        thankYou.hidden = false;

      } catch (err) {
        console.error(err);
        alert('Erreur : ' + (err.message || 'Impossible d\'envoyer le témoignage'));
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.hidden = false;
        if (btnLoading) btnLoading.hidden = true;
      }
    });
  }

  if (btnNew) {
    btnNew.addEventListener('click', function () {
      form.reset();
      if (wordCountEl) wordCountEl.textContent = '0';
      form.hidden = false;
      thankYou.hidden = true;
    });
  }
});
