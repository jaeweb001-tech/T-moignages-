// ============================================================================
// Purge automatique des témoignages de plus de 20 jours.
// Exécuté chaque jour par GitHub Actions (voir .github/workflows/cleanup.yml)
// afin que la suppression ait lieu même si l'administrateur ne se connecte pas.
// ============================================================================

const admin = require('firebase-admin');

const RETENTION_DAYS = 20;

function main(){
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if(!serviceAccountJson){
    console.error('Variable FIREBASE_SERVICE_ACCOUNT manquante.');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();
  run(db).catch(err => {
    console.error('Erreur pendant la purge :', err);
    process.exit(1);
  });
}

async function run(db){
  const cutoff = admin.firestore.Timestamp.fromMillis(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const snapshot = await db.collection('temoignages')
    .where('createdAt', '<', cutoff)
    .get();

  if(snapshot.empty){
    console.log('Aucun témoignage à purger.');
    return;
  }

  const batchSize = 400;
  const docs = snapshot.docs;

  for(let i = 0; i < docs.length; i += batchSize){
    const batch = db.batch();
    docs.slice(i, i + batchSize).forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }

  console.log(`${docs.length} témoignage(s) de plus de ${RETENTION_DAYS} jours ont été supprimés.`);
}

main();
