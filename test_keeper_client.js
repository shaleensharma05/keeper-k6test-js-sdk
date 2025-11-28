// test_keeper_client.js
// Simple Node script to verify Keeper SDK + credentials

const { getSecretByUid } = require('./keeper_client');

const recordUid = process.env.KEEPER_SECRET_UID;

if (!recordUid) {
  console.error('Please set KEEPER_SECRET_UID before running this script.');
  process.exit(1);
}

(async () => {
    try {
    const start = Date.now();
    const secret = await getSecretByUid(recordUid);
    const elapsed = Date.now() - start;

    console.log('✅ Successfully fetched secret from Keeper.');
    console.log('Real Keeper latency (ms):', elapsed);
    console.log('Record UID:', secret.recordUid || secret.uid);  // <- updated
    console.log('Record title:', secret.data?.title);
  } catch (err) {
    console.error('❌ Error fetching secret from Keeper:');
    console.error(err);
  }
})();
