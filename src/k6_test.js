import http from 'k6/http';
import { sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { check } from 'k6';

const backendLatency = new Trend('backend_latency');
const backendErrors = new Rate('backend_errors');
const realKeeperCalls = new Counter('real_keeper_calls');

const BACKEND_URL = __ENV.BACKEND_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    secret_retrieval: {
      executor: 'per-vu-iterations',
      vus: 2,           // 2 users
      iterations: 6,    // each runs 4 times → 8 total calls
      exec: 'secret_scenario',
      maxDuration: '60s',
    },
  },
  thresholds: {
    backend_latency: ['p(95)<2000'],
    backend_errors: ['rate<0.05'],
    real_keeper_calls: ['count<=10'],
  },
};

export function secret_scenario() {
  const url = `${BACKEND_URL}/keeper/get-secret`;

  const start = Date.now();
  const res = http.get(url);
  const elapsed = Date.now() - start;

  backendLatency.add(elapsed);

  // Basic check: we accept 200 (success) or 429 (limit reached)
  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
  });

  let body;
  let ok = false;
  try {
    body = res.json();
    ok = res.status === 200 && body && body.ok === true;
  } catch (_) {
    ok = false;
  }

  // Count hard errors: anything that's NOT 200 or 429
  const isHardError = !(res.status === 200 || res.status === 429);
  backendErrors.add(isHardError);

  // Count all successful 200 responses as real Keeper calls
  if (res.status === 200 && ok) {
    realKeeperCalls.add(1);
  }

  // Pace between iterations
  sleep(5);
}
