Shield IoT Predictive Maintenance (MERN)

Getting Started (Local)
- Prereqs: Node 20+, MongoDB 7+ (or use Docker), pnpm/npm.
- Server:
  - cd server
  - Create .env with: PORT=5000, MONGO_URI=mongodb://localhost:27017/sheild_iot, JWT_SECRET=supersecret_dev_key, CLIENT_ORIGIN=http://localhost:5173
  - npm install
  - npm run seed
  - npm run dev

- Client:
  - cd client
  - npm install
  - npm run dev
  - Env: VITE_API_URL=http://localhost:5000/api, VITE_SOCKET_URL=http://localhost:5000

Docker (All-in-one)
- docker compose up -d --build
- App: http://localhost:5173 (served by Nginx container)
- API: http://localhost:5000/api

Seed Credentials
- admin@example.com / password

API Examples
```bash
# Login
curl -s http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"password"}'

# List machines (use token from login)
curl -s http://localhost:5000/api/machines \
  -H "Authorization: Bearer $TOKEN"

# Ingest sensor sample
curl -s http://localhost:5000/api/sensors/ingest \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"machineId":"M-1001","temperature":55,"vibration":12,"current":6.5}'

# Predict
curl -s http://localhost:5000/api/predictions/predict \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"machineId":"M-1001","features":{"vibration":12,"temperature":55}}'
```

Tech & Structure
- client/: React + Vite, Tailwind, MUI, Recharts, Zustand, React Query
- server/: Express, MongoDB/Mongoose, JWT auth, Socket.IO, PDF/Excel export
- sockets/: Real-time channels for sensors and alerts
- routes/: auth, machines, sensors, predictions, maintenance, reports, alerts
- models/: User, Machine, SensorLog, Prediction, Maintenance, Report, Alert

Notes
- **ML Integration**: Isolation Forest model for anomaly detection
  - Auto-trains every 6 hours on historical data
  - Real-time anomaly prediction on sensor readings
  - See `server/ML_SETUP.md` for ML setup instructions
- Tailwind v4 is used via CSS import. Theme is dark with teal accents.

ML Model Setup
1. Install Python dependencies: `pip install -r server/requirements.txt`
2. Model auto-trains every 6 hours (or manually: `POST /api/predict/train`)
3. Predictions use Isolation Forest for anomaly detection
4. Machine state calculated from ML predictions


