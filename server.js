const express = require('express');
const { getSecretByUid } = require('./keeper_client');

const app = express();
const port = process.env.PORT || 3000;

// HARD SAFETY LIMIT
const MAX_REAL_CALLS = 10;
let realCallCount = 0;

app.get('/keeper/get-secret', async (req, res) => {
  const recordUid = process.env.KEEPER_SECRET_UID;

  if (!recordUid) {
    console.error('[SERVER] KEEPER_SECRET_UID is not set.');
    return res.status(500).json({
      ok: false,
      error: 'KEEPER_SECRET_UID not set',
    });
  }

  //  HARD BLOCK AFTER 10 REAL CALLS
  if (realCallCount >= MAX_REAL_CALLS) {
    console.warn('Max real Keeper call limit reached (10). Denying request.');
    return res.status(429).json({
      ok: false,
      message: 'Max real Keeper API call limit reached',
      realCallCount,
      limit: MAX_REAL_CALLS,
    });
  }

  try {
    realCallCount++;

    const secret = await getSecretByUid(recordUid); // REAL Keeper SDK call

    return res.json({
      ok: true,
      fromCache: false,
      realCallCount,
      secretSummary: {
        uid: secret.recordUid || secret.uid,
        title: secret.data?.title,
      },
    });
  } catch (err) {
    console.error('[SERVER] Backend error:', err.message || err);
    return res.status(500).json({
      ok: false,
      error: 'backend error',
    });
  }
});

app.listen(port, () => {
  console.log(`Keeper backend listening at http://localhost:${port}`);
  console.log(`Max real Keeper calls allowed: ${MAX_REAL_CALLS}`);
});
