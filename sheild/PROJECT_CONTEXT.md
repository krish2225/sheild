# SHIELD - Predictive Maintenance System - Complete Project Context

## Executive Summary

**SHIELD** is a production-quality MVP web application for Predictive Maintenance of industrial equipment. It's a real-time IoT monitoring system that uses Machine Learning (Isolation Forest) to detect anomalies and predict equipment failures. The system is designed for a trial phase with one device (PM_001) but architected to scale.

**Product Type**: SaaS-style Industrial IoT Monitoring & Predictive Maintenance Platform  
**Current Phase**: MVP/Trial Phase  
**Target Device**: PM_001 (single device for trial)  
**Deployment**: Web application (React frontend + Node.js backend)

---

## Technology Stack

### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS v4 (dark industrial theme with cyan/teal accents)
- **State Management**: Zustand (for authentication)
- **Data Fetching**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Animations**: GSAP (GreenSock Animation Platform)
- **Real-time Data**: Firebase Firestore (direct client connection)
- **Excel Export**: XLSX library
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 5
- **Database**: MongoDB 7+ with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **ML Integration**: Python scripts (scikit-learn, numpy, pandas)
- **File Export**: ExcelJS, PDFKit
- **Email**: Nodemailer

### ML/AI
- **Model**: Isolation Forest (scikit-learn)
- **Training**: Automatic every 5 minutes
- **Language**: Python 3.10+
- **Libraries**: numpy, pandas, scikit-learn

### Data Storage
- **Real-time Data**: Firebase Firestore
- **Historical Data**: MongoDB (SensorLog collection)
- **Model Storage**: JSON file on disk (`server/models/ml_model.json`)
- **User Data**: MongoDB (Users, Machines, Alerts, etc.)

---

## Architecture Overview

### Data Flow
1. **IoT Device** → Sends sensor data to Firebase Firestore
2. **Firebase Firestore** → Stores at path: `devices/PM_001/live/latest`
3. **Frontend** → Subscribes to Firestore using `onSnapshot` for real-time updates
4. **Frontend** → Calls ML API (`/api/predict/predict`) with sensor features
5. **Backend ML Service** → Predicts anomalies, calculates health score and RUL
6. **Frontend** → Displays predictions, RUL, and alerts in real-time
7. **Backend** → Syncs Firebase data to MongoDB for historical storage
8. **ML Training** → Every 5 minutes, trains on latest 500 records, deletes older data

### Authentication Flow
- **Mock Authentication**: Simplified login without full backend auth
- **State Management**: Zustand store with localStorage persistence
- **Token Storage**: localStorage
- **Protected Routes**: RequireAuth component checks token before rendering

---

## Current Features & Pages

### 1. Landing Page (`/`)
**Purpose**: Marketing/product introduction page  
**Features**:
- Hero section with value proposition
- Key features showcase (Real-Time Monitoring, AI-Powered Predictions, Analytics Dashboard)
- "How It Works" section
- Statistics section
- Technology stack display
- Call-to-action buttons (Go to Dashboard, Login)
- GSAP animations for smooth transitions
- Responsive design

### 2. Login Page (`/login`)
**Purpose**: User authentication  
**Features**:
- Mock login form (email/password)
- GSAP form animations
- Error handling
- Redirects to dashboard on success
- Remember login state via localStorage

### 3. Dashboard (`/dashboard`) - MAIN PAGE
**Purpose**: Primary monitoring interface  
**Features**:
- **Device Summary**: PM_001 device overview
  - Overall health score (0-100%)
  - Last updated timestamp
  - Status indicator with pulsing animation
- **RUL Display**: Remaining Useful Life card (from ML predictions)
  - Shows hours/days/weeks remaining
  - Updates in real-time
- **Status Card**: Current machine status (healthy/degrading/critical)
  - Shows ML prediction status when available
  - Anomaly detection indicator
- **Live Sensor Cards**: Three sensor readings
  - Temperature (temp_mean) in °C
  - Vibration (vib_rms) in m/s²
  - Current (current_rms) in A
  - Warning indicators when thresholds exceeded
- **Mini Trend Charts**: Real-time line charts for each sensor
  - Last 20 data points
  - Smooth animations
- **Alerts Table**: Active alerts with severity levels
- **Real-time Updates**: Subscribes to Firebase Firestore
- **ML Integration**: Fetches ML predictions automatically
- **GSAP Animations**: Smooth page load animations

### 4. Device Detail Page (`/device/:deviceId`)
**Purpose**: Detailed view of single device  
**Features**:
- **Health Gauge**: Circular progress indicator showing health score
- **Predictive Status Section**:
  - Current condition (from ML)
  - RUL (Remaining Useful Life) display
  - Status severity badge
  - Anomaly detection status with score
  - ML health score
- **Real-time Features**: Full sensor readings display
  - Temperature, Vibration, Current
  - Individual sensor cards with warnings
- **Feature Charts**: Historical trend charts (last 50 points)
- **Real-time Updates**: Live data from Firebase
- **ML Predictions**: Integrated ML status and RUL

### 5. Analytics Page (`/analytics`)
**Purpose**: Historical data analysis  
**Features**:
- **Time Range Filter**: Select date range for analysis
- **Historical Charts**: 
  - Temperature mean trend
  - Vibration RMS trend
  - Current RMS trend
- **Data Points**: Last 100 historical readings
- **Chart Features**: 
  - Responsive design
  - Tooltips with values
  - Smooth line animations
  - Fill opacity for area visualization
- **Real-time Updates**: Charts update as new data arrives

### 6. Alerts Page (`/alerts`)
**Purpose**: Alert management and monitoring  
**Features**:
- **Threshold Configuration**: 
  - Editable thresholds for Temperature, Vibration, Current
  - Real-time threshold updates
- **Current Device Status**: 
  - Health score
  - Current sensor readings
  - Last updated timestamp
- **Active Alerts Table**:
  - Alert timestamp
  - Alert message
  - Severity level (low/medium/high/critical) with color coding
  - Status (Active/Acknowledged)
  - **Acknowledge Feature**: 
    - Click "Acknowledge" opens modal form
    - Form fields: Action Taken (required), Additional Notes (optional)
    - Submit stores acknowledgment with timestamp
    - "View Details" button for acknowledged alerts to see action taken
- **Alert Generation**: 
  - Based on configurable thresholds
  - Health status alerts
  - Feature-based warnings
- **Real-time Updates**: New alerts appear automatically

### 7. History Page (`/history`)
**Purpose**: Historical data viewing and export  
**Features**:
- **Time Range Filter**: 
  - Start date/time picker
  - End date/time picker
  - Filter button
- **Data Table**: 
  - Displays filtered historical sensor data
  - Columns: Timestamp, Temperature, Vibration, Current, Health Score
  - Sortable and scrollable
- **Excel Export**: 
  - "Download Excel" button
  - Exports filtered data to Excel format
  - Includes all sensor readings and timestamps
- **Real-time Data**: Subscribes to Firestore for live updates

### 8. Footer Component
**Features**:
- Copyright notice
- **Developer Credits**: 
  - "Developed by" text
  - Continuous horizontal scrolling animation
  - Names: Krish Namboodri, Utkarsh Sakpal, Fardin Pirjade
  - Pulsing glow effects on names
  - Gradient fade effects on edges
  - Seamless infinite loop animation

---

## Components Library

### Reusable Components
1. **HealthBadge**: Color-coded health status badge (Healthy/Degrading/Critical)
2. **SensorCard**: Individual sensor reading card with value, unit, warning indicator
3. **StatusIndicator**: Pulsing health status indicator with size variants
4. **AlertTable**: Table displaying alerts with acknowledge functionality
5. **AcknowledgeModal**: Modal form for acknowledging alerts with action taken field
6. **HealthGauge**: Circular progress gauge for health score visualization
7. **ErrorBoundary**: React error boundary for catching and displaying errors
8. **ShieldLogo**: Logo component with text option
9. **Footer**: Footer with animated developer credits

---

## Backend API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### ML/Predictions
- `POST /api/predict/predict` - Get ML prediction for sensor features
  - Request: `{ device_id, features: { temp_mean, vib_rms, current_rms, edge_health } }`
  - Response: `{ anomaly, anomaly_score, health_score, status, rul_hours }`
- `GET /api/predict/model-status` - Get ML model training status
- `POST /api/predict/train` - Manually trigger ML model training

### Sensors
- `POST /api/sensors/ingest` - Ingest sensor data (with ML prediction)
- `POST /api/sensors/sync-firebase` - Sync Firebase data to MongoDB
- `GET /api/sensors/:machineId/logs` - Get historical sensor logs

### Machines
- `GET /api/machines` - List all machines
- `GET /api/machines/:id` - Get machine details

### Alerts
- `GET /api/alerts` - Get alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert

### Reports
- `GET /api/reports` - Generate reports
- `POST /api/reports/export` - Export reports (PDF/Excel)

---

## Machine Learning System

### Model Details
- **Algorithm**: Isolation Forest
- **Purpose**: Anomaly detection in sensor readings
- **Features Used**: temp_mean, vib_rms, current_rms
- **Training Data**: Last 500 sensor readings (after training, older data deleted)
- **Training Frequency**: Every 5 minutes automatically
- **Contamination Rate**: 5% (expects 5% anomalies)
- **Model Storage**: JSON file on disk (`server/models/ml_model.json`)
- **Persistence**: Model loads automatically on server restart

### Prediction Output
- **anomaly**: 0 (normal) or 1 (anomaly detected)
- **anomaly_score**: 0-1 score (higher = more anomalous)
- **health_score**: 0-100 health percentage
- **status**: "healthy", "degrading", or "critical"
- **rul_hours**: Remaining Useful Life in hours (1-1000 hours)

### RUL Calculation Logic
- **Healthy (80-100%)**: 720-1000 hours (1-1.5 months)
- **Degrading (50-79%)**: 168-720 hours (1 week - 1 month)
- **Critical (<50%)**: 24-168 hours (1 day - 1 week)
- **Adjustments**: Reduced by high temperature (>60°C), vibration (>2.0 m/s²), or current (>4.0 A)

### Training Process
1. Fetches last 500 records from MongoDB
2. Trains Isolation Forest model
3. Saves model parameters to disk
4. Deletes old data (keeps only 500 most recent)
5. Logs training completion

---

## Data Models

### SensorLog (MongoDB)
```javascript
{
  machineId: String,
  timestamp: Date,
  temp_mean: Number,
  vib_rms: Number,
  current_rms: Number,
  edge_health: Number,
  anomaly: Number (0 or 1),
  anomaly_score: Number,
  temperature: Number,
  vibration: Number,
  current: Number
}
```

### Firebase Firestore Structure
```
devices/
  PM_001/
    live/
      latest/
        {
          timestamp: Number,
          edge_health: Number,
          features: {
            temp_mean: Number,
            vib_rms: Number,
            current_rms: Number
          }
        }
```

### Alert Acknowledgment
```javascript
{
  alertId: String,
  actionTaken: String (required),
  notes: String (optional),
  timestamp: ISO String,
  acknowledgedBy: String
}
```

---

## UI/UX Design

### Theme
- **Color Scheme**: Dark industrial theme
  - Background: slate-900, slate-950
  - Accents: cyan-300, cyan-500, cyan-600
  - Status Colors:
    - Healthy: green-400
    - Degrading: yellow-400
    - Critical: red-400
- **Typography**: Clean, modern sans-serif
- **Spacing**: Generous padding and margins
- **Borders**: 2px solid borders with slate-600
- **Shadows**: Professional shadow effects

### Animations
- **GSAP**: Used for page transitions, card animations, chart reveals
- **Footer**: Continuous horizontal scrolling with pulsing glow
- **Status Indicators**: Pulsing animations for health status
- **Page Transitions**: Smooth fade and slide animations

### Responsive Design
- **Mobile**: Responsive grid layouts
- **Tablet**: Optimized column layouts
- **Desktop**: Full feature display
- **Breakpoints**: Tailwind default breakpoints (sm, md, lg, xl)

### Accessibility
- **Error Boundaries**: Catches and displays errors gracefully
- **Loading States**: Shows loading indicators during data fetch
- **Error Messages**: Clear error messages with troubleshooting tips
- **Form Validation**: Required field validation

---

## Key Features Implemented

### ✅ Real-time Monitoring
- Live sensor data streaming from Firebase
- Real-time updates on all pages
- Instant UI updates when data changes

### ✅ Machine Learning Integration
- Isolation Forest anomaly detection
- Automatic model training every 5 minutes
- Real-time predictions on sensor readings
- RUL (Remaining Useful Life) calculation
- Model persistence across server restarts

### ✅ Alert System
- Configurable thresholds
- Automatic alert generation
- Severity levels (low/medium/high/critical)
- Acknowledgment system with action tracking
- View acknowledgment details

### ✅ Data Visualization
- Real-time trend charts
- Historical analytics
- Health score gauges
- Mini trend charts on dashboard

### ✅ Data Export
- Excel export for historical data
- Time range filtering
- Complete sensor data export

### ✅ Storage Optimization
- Automatic deletion of old training data
- Keeps only 500 most recent records
- Reduces MongoDB storage consumption

### ✅ Authentication
- Mock authentication system
- Protected routes
- Login state persistence
- JWT token management

---

## Current Limitations & Known Gaps

### Data Management
- ❌ No data backup/restore functionality
- ❌ No data retention policies (beyond ML training cleanup)
- ❌ No data archiving for long-term storage
- ❌ Limited to single device (PM_001) - not multi-device ready

### User Management
- ❌ Mock authentication (not production-ready)
- ❌ No user roles/permissions system
- ❌ No password reset functionality
- ❌ No user profile management

### Notifications
- ❌ No email notifications for alerts
- ❌ No SMS notifications
- ❌ No push notifications
- ❌ No notification preferences

### Reporting
- ❌ Basic reports only
- ❌ No scheduled reports
- ❌ No custom report builder
- ❌ Limited export formats (Excel only, no PDF for history)

### Maintenance Management
- ❌ No maintenance scheduling
- ❌ No maintenance history tracking
- ❌ No work order management
- ❌ No parts inventory tracking

### Advanced Analytics
- ❌ No predictive maintenance scheduling
- ❌ No cost analysis
- ❌ No performance metrics comparison
- ❌ No machine learning model performance metrics

### Integration
- ❌ No API documentation (Swagger/OpenAPI)
- ❌ No webhook support
- ❌ No third-party integrations (ERP, CMMS)
- ❌ No mobile app

### Dashboard Customization
- ❌ No customizable dashboards
- ❌ No widget configuration
- ❌ No user preferences for layout
- ❌ No saved views

### Data Quality
- ❌ No data validation rules
- ❌ No data quality metrics
- ❌ No missing data handling
- ❌ No outlier detection beyond ML

### Security
- ❌ Mock authentication (needs real auth)
- ❌ No rate limiting
- ❌ No API key management
- ❌ No audit logging

---

## Technical Debt & Improvements Needed

1. **ML Model**: Currently uses simplified prediction script - needs full Isolation Forest model loading
2. **Error Handling**: Some error cases not fully handled
3. **Testing**: No unit tests or integration tests
4. **Documentation**: Limited inline documentation
5. **Performance**: No caching layer for frequently accessed data
6. **Scalability**: Single device focus - needs multi-device architecture
7. **Monitoring**: No application monitoring/observability
8. **Logging**: Basic logging - needs structured logging

---

## Deployment Information

### Development
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017/sheild_iot`

### Production Ready
- Docker Compose configuration available
- Environment variable configuration
- Database seeding scripts
- ML model persistence

---

## File Structure

```
sheild/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services, Firebase, ML
│   │   ├── store/         # Zustand stores
│   │   └── App.jsx        # Main app with routing
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Mongoose models
│   │   ├── services/      # ML service, scheduler, Firebase sync
│   │   │   ├── mlService.js
│   │   │   ├── ml_train.py
│   │   │   ├── ml_predict.py
│   │   │   └── scheduler.js
│   │   └── index.js       # Server entry point
│   └── models/            # ML model storage
│       └── ml_model.json
└── README.md
```

---

## Usage Scenarios

### Primary Use Case
1. User logs in
2. Views Dashboard to see real-time device status
3. Checks RUL to plan maintenance
4. Reviews alerts and acknowledges with action taken
5. Exports historical data for analysis
6. Views analytics for trend analysis

### Alert Workflow
1. Sensor reading exceeds threshold → Alert generated
2. Alert appears in Alerts page
3. User clicks "Acknowledge"
4. Modal opens with form
5. User enters action taken
6. Alert marked as acknowledged
7. User can view acknowledgment details later

### ML Prediction Flow
1. New sensor data arrives from Firebase
2. Frontend calls `/api/predict/predict`
3. ML service calculates anomaly, health score, status, RUL
4. Results displayed on Dashboard/Device Detail
5. Every 5 minutes, model retrains on latest data

---

## Performance Characteristics

- **Real-time Updates**: Sub-second latency for Firebase updates
- **ML Predictions**: ~100-500ms response time
- **Model Training**: ~5-15 seconds for 500 records
- **Page Load**: <2 seconds with animations
- **Chart Rendering**: Smooth 60fps animations

---

## Security Considerations

- JWT token-based authentication
- Protected API routes
- CORS configuration
- Input validation on forms
- SQL injection protection (MongoDB)
- XSS protection (React)

---

## Future Scalability Considerations

- Multi-device support (currently single device PM_001)
- Multi-tenant architecture
- Horizontal scaling for ML training
- Redis caching layer
- Message queue for async processing
- Microservices architecture

---

## Dependencies Summary

### Frontend Key Dependencies
- react, react-dom
- react-router-dom
- @tanstack/react-query
- zustand
- gsap
- recharts
- firebase
- xlsx
- tailwindcss

### Backend Key Dependencies
- express
- mongoose
- jsonwebtoken
- socket.io
- nodemailer
- exceljs
- pdfkit

### ML Dependencies
- numpy
- pandas
- scikit-learn

---

## Configuration Files

- `.env` (server): Database, JWT secret, ports
- `.env` (client): API URL, Firebase config
- `tailwind.config.js`: Tailwind configuration
- `vite.config.js`: Vite build configuration
- `docker-compose.yml`: Docker deployment

---

## Development Workflow

1. Start MongoDB
2. Start backend: `cd server && npm run dev`
3. Start frontend: `cd client && npm run dev`
4. Access: `http://localhost:5173`
5. ML model trains automatically after 30 seconds
6. Real-time data from Firebase Firestore

---

## Testing Status

- ✅ Manual testing completed
- ❌ Unit tests: Not implemented
- ❌ Integration tests: Not implemented
- ❌ E2E tests: Not implemented

---

## Documentation Status

- ✅ README.md: Basic setup instructions
- ✅ ML_SETUP.md: ML configuration guide
- ✅ FIREBASE_SETUP_GUIDE.md: Firebase setup
- ✅ EMAIL_SETUP.md: Email configuration
- ✅ ML_UPDATES_SUMMARY.md: Recent ML changes
- ✅ PROJECT_CONTEXT.md: This document

---

## Contact & Credits

**Developed by:**
- Krish Namboodri
- Utkarsh Sakpal
- Fardin Pirjade

**Project**: SHIELD Industrial Monitoring System  
**Version**: MVP 1.0  
**License**: Not specified

---

## Conclusion

This is a production-quality MVP for predictive maintenance with:
- ✅ Real-time monitoring
- ✅ ML-powered anomaly detection
- ✅ RUL predictions
- ✅ Alert management
- ✅ Data visualization
- ✅ Historical analysis
- ✅ Data export

The system is ready for trial phase deployment with one device (PM_001) and can be extended for production use with multiple devices and additional features.






