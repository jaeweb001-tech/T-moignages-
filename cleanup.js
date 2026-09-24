// ============================================================================
// Purge automatique des témoignages.
// - Témoignages jamais partagés sur WhatsApp : supprimés après 60 jours.
// - Témoignages déjà partagés sur WhatsApp : supprimés après 35 jours à
//   partir de la date de partage (ils sont déjà sauvegardés dans le groupe).
// Exécuté chaque jour par GitHub Actions (voir .github/workflows/cleanup.yml)
// afin que la suppression ait lieu même si l'administrateur ne se connecte pas.
// ============================================================================

const admin = require('firebase-admin');

const RETENTION_DAYS = 60;
const SHARED_RETENTION_DAYS = 35;

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
  const now = Date.now();
  const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const sharedRetentionMs = SHARED_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  const snapshot = await db.collection('temoignages').get();

  if(snapshot.empty){
    console.log('Aucun témoignage à purger.');
    return;
  }

  const toDelete = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    if(!data.createdAt) return;

    const createdMs = data.createdAt.toMillis();
    const sharedMs = data.partageWhatsappAt ? data.partageWhatsappAt.toMillis() : null;

    const expired = sharedMs
      ? (now - sharedMs) > sharedRetentionMs
      : (now - createdMs) > retentionMs;

    if(expired){
      toDelete.push(doc.ref);
    }
  });

  if(toDelete.length === 0){
    console.log('Aucun témoignage à purger.');
    return;
  }

  const batchSize = 400;
  for(let i = 0; i < toDelete.length; i += batchSize){
    const batch = db.batch();
    toDelete.slice(i, i + batchSize).forEach(ref => batch.delete(ref));
    await batch.commit();
  }

  console.log(`${toDelete.length} témoignage(s) supprimé(s) (60 jours, ou 35 jours si déjà partagés sur WhatsApp).`);
}

main();
