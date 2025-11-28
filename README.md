# Keeper + k6 Performance Challenge

This project demonstrates a **safe performance test** against the **Keeper Secrets Manager JavaScript SDK** using:

- Node.js backend
- k6 for load testing
- A strict **hard cap of 10 real Keeper API calls**
- Safe simulation beyond that limit using **HTTP 429**

The goal is to validate correctness, load-test behavior, and security controls **without exceeding real Keeper API limits**.

---

## 📦 Deliverables

- 📁 k6 test files  
- 📄 README with:
  - Setup instructions  
  - Load model explanation  
  - Credential handling guidelines  
  - Explanation of how the **10-request simulation limit** is enforced  
- 📊 Optional: sample k6 output  

---

## 🏆 Evaluation Criteria

- ✅ Correct Keeper SDK usage  
- ✅ Load simulation without exceeding **10 real API calls**  
- ✅ Performance engineering thoughtfulness  
- ✅ Clean code and structure  

---

## 1. Project Structure

**Backend**
- `server.js` – Express API with 10-call hard cap  
- `keeper_client.js` – Keeper SDK wrapper  
- `test_keeper_client.js` – First-time connectivity validation  
- `package.json`, `package-lock.json`

**k6**
- `src/k6_test.js` – Main load test  

**Security**
- `.gitignore` – Protects secrets  
- `ksm-config.json` – Local Keeper config (**never committed**)

---

## 2. Install Dependencies (macOS Only)

```bash
brew install node
brew install k6
node -v
npm -v
k6 version
3. Install Project Dependencies
bash
Copy code
npm install
This creates:

Copy code
node_modules/
4. Keeper Trial + App + Device + Record UID
Create a Keeper trial account

Go to Secrets Manager

Create an Application

Add a Device

Copy:

One-Time Access Token

Keeper Hostname

Create a secret record

Copy the Record UID

5. First-Time Keeper Authentication (Recommended)
bash
Copy code
export KEEPER_ONE_TIME_TOKEN="YOUR_TOKEN"
export KEEPER_HOSTNAME="YOUR_HOST"
export KEEPER_SECRET_UID="YOUR_RECORD_UID"

node test_keeper_client.js
✅ This creates:

arduino
Copy code
ksm-config.json
Now unset the one-time token:

bash
Copy code
unset KEEPER_ONE_TIME_TOKEN
From this point forward, authentication uses only ksm-config.json.

6. Start the Backend (Required Every Run)
bash
Copy code
export KEEPER_SECRET_UID="YOUR_RECORD_UID"
node server.js
Server runs at:

arduino
Copy code
http://localhost:3000
7. Required Sanity Check
bash
Copy code
curl http://localhost:3000/keeper/get-secret
First 10 → 200 OK

After 10 → 429 Too Many Requests

8. Run the k6 Test
bash
Copy code
export BACKEND_URL="http://localhost:3000"
k6 run src/k6_test.js
9. Load Model (k6 Layer – Exact)
From src/k6_test.js:

Executor: per-vu-iterations

Virtual Users: 2

Iterations per VU: 4

Total Requests: 8

Pacing: sleep(5) seconds

Max Duration: 60s

This produces a steady, low-intensity load that safely stays under the real Keeper API limit.

10. Dual Safety Design (Node + k6)
✅ Node.js Hard Cap (Authoritative)
In-memory counter in server.js

After 10 real Keeper calls → always returns HTTP 429

Guarantees Keeper is never overused

✅ k6 Hard Cap (Assertion)
In k6_test.js:

js
Copy code
real_keeper_calls: ['count<=10']
If the backend ever exceeds 10 real calls, the k6 test fails automatically.

11. Output Summary
test_keeper_client.js

Confirms Keeper connectivity and real latency

curl

Confirms the 10-call limit

k6 run

Shows latency percentiles

Error rate

real_keeper_calls counter

All thresholds should pass ✅

12. Git Safety
.gitignore blocks:

node_modules/

ksm-config.json

.env

.DS_Store

.vscode/, .idea/

*.log

✅ No secrets are ever committed.

13. Full End-to-End Setup (macOS)
bash
Copy code
git clone <repo-url>
cd keeper-k6-perf-challenge

npm install

export KEEPER_ONE_TIME_TOKEN="..."
export KEEPER_HOSTNAME="..."
export KEEPER_SECRET_UID="YOUR_RECORD_UID"
node test_keeper_client.js
unset KEEPER_ONE_TIME_TOKEN

export KEEPER_SECRET_UID="YOUR_RECORD_UID"
node server.js

curl http://localhost:3000/keeper/get-secret

export BACKEND_URL="http://localhost:3000"
k6 run src/k6_test.js
