// keeper_client.js
// Node-side wrapper around Keeper Secrets Manager JavaScript SDK

const {
  initializeStorage,
  localConfigStorage,
  getSecrets,
} = require('@keeper-security/secrets-manager-core');

async function getSecretByUid(recordUid) {
  if (!recordUid) {
    throw new Error('Missing record UID');
  }

  const oneTimeToken = process.env.KEEPER_ONE_TIME_TOKEN || null;
  const hostName = process.env.KEEPER_HOSTNAME || null;

  // File-based config, as per Keeper docs (ksm-config.json in project dir)
  const storage = localConfigStorage('ksm-config.json');

  // On first run, initialize with one-time token (creates ksm-config.json)
  if (oneTimeToken) {
    await initializeStorage(storage, oneTimeToken, hostName);
  }

  // Retrieve the specific record by UID
  const { records } = await getSecrets({ storage }, [recordUid]);
  if (!records || records.length === 0) {
    throw new Error(`No records found for UID ${recordUid}`);
  }

  return records[0];
}

module.exports = { getSecretByUid };
