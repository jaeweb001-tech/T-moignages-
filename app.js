// Formulaire public - JAE Ministries

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('temoignage-form');
  const textarea = document.getElementById('temoignage');
  const wordCountEl = document.getElementById('word-count');
  const thankYou = document.getElementById('thank-you');
  const submitBtn = document.getElementById('submit-btn');
  const btnNew = document.getElementById('btn-new');

  function countWords(text) {
    return (text.trim().match(/\b\w+\b/gu) || []).length;
  }

  textarea.addEventListener('input', () => {
    wordCountEl.textContent = countWords(textarea.value);
  });

  form.addEventListener('submit', async (e) => {
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

    if (countWords(temoignage) > 5000) {
      alert('Le témoignage ne doit pas dépasser 5000 mots.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').hidden = true;
    submitBtn.querySelector('.btn-loading').hidden = false;

    try {
      // Numéro d'ordre atomique
      const compteurRef = db.collection('compteurs').doc('ordre');
      let nouvelOrdre = 1;

      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(compteurRef);
        if (doc.exists) {
          nouvelOrdre = (doc.data().valeur || 0) + 1;
        }
        transaction.set(compteurRef, { valeur: nouvelOrdre }, { merge: true });
      });

      await db.collection('temoignages').add({
        ordre: nouvelOrdre,
        genre: genreInput.value,
        temoignage: temoignage,
        nom: document.getElementById('nom').value.trim() || null,
        whatsapp: document.getElementById('whatsapp').value.trim() || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      form.hidden = true;
      thankYou.hidden = false;

    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').hidden = false;
      submitBtn.querySelector('.btn-loading').hidden = true;
    }
  });

  btnNew.addEventListener('click', () => {
    form.reset();
    wordCountEl.textContent = '0';
    form.hidden = false;
    thankYou.hidden = true;
  });
});
