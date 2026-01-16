# ML Model Detailed Working Documentation

## Table of Contents
1. [Overview](#overview)
2. [Algorithm: Isolation Forest](#algorithm-isolation-forest)
3. [System Architecture](#system-architecture)
4. [Training Process](#training-process)
5. [Prediction Process](#prediction-process)
6. [Data Flow](#data-flow)
7. [Feature Engineering](#feature-engineering)
8. [Model Persistence](#model-persistence)
9. [Health Score Calculation](#health-score-calculation)
10. [Remaining Useful Life (RUL) Calculation](#remaining-useful-life-rul-calculation)
11. [Fallback Mechanisms](#fallback-mechanisms)
12. [Scheduling System](#scheduling-system)
13. [Configuration Parameters](#configuration-parameters)
14. [File Structure](#file-structure)

---

## Overview

The SHIELD Predictive Maintenance System uses **Isolation Forest**, an unsupervised machine learning algorithm, to detect anomalies in industrial equipment sensor data. The model continuously learns from live sensor readings and automatically retrains to adapt to changing equipment behavior patterns.

### Key Features
- **Unsupervised Learning**: No labeled data required - learns normal patterns automatically
- **Real-time Anomaly Detection**: Processes sensor readings in real-time
- **Automatic Retraining**: Self-updates every 5 minutes with latest data
- **Persistence**: Model state saved to disk, survives server restarts
- **Health Scoring**: Calculates equipment health percentage (0-100)
- **RUL Prediction**: Estimates Remaining Useful Life in hours
- **Fallback Logic**: Graceful degradation when ML model unavailable

---

## Algorithm: Isolation Forest

### What is Isolation Forest?

Isolation Forest is an **ensemble-based anomaly detection algorithm** that works on the principle:
> "Anomalies are few and different, so they are easier to isolate from normal instances."

### How It Works

1. **Tree Construction**: Builds multiple decision trees (100 trees by default)
2. **Random Splitting**: Each tree randomly selects features and split values
3. **Isolation Path**: Anomalies require fewer splits to isolate (shorter paths)
4. **Anomaly Score**: Calculated as average path length across all trees
   - **Negative scores** → Normal behavior (longer paths)
   - **Positive scores** → Anomalous behavior (shorter paths)

### Why Isolation Forest?

✅ **Advantages:**
- Works well with high-dimensional data
- No need for labeled training data
- Fast training and prediction
- Handles outliers effectively
- Good for industrial IoT sensor data

❌ **Limitations:**
- Assumes anomalies are rare (5% contamination rate)
- May struggle with clustered anomalies
- Requires sufficient training data (minimum 100 samples)

---

## System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SHIELD ML System                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │   MongoDB    │◄─────│  MLService   │─────►│  Python  │  │
│  │  SensorLog   │      │  (Node.js)   │      │  Scripts │  │
│  │  Collection  │      │              │      │          │  │
│  └──────────────┘      └──────────────┘      └──────────┘  │
│         ▲                      │                   │         │
│         │                      │                   │         │
│         │              ┌───────▼────────┐          │         │
│         │              │  Model File     │          │         │
│         │              │ ml_model.json   │          │         │
│         │              └────────────────┘          │         │
│         │                      │                   │         │
│         └──────────────────────┼───────────────────┘         │
│                                │                             │
│                         ┌──────▼──────┐                      │
│                         │  Scheduler  │                      │
│                         │  Service    │                      │
│                         └─────────────┘                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend**: Node.js (Express.js)
- **ML Framework**: Python (scikit-learn)
- **Database**: MongoDB (SensorLog collection)
- **Communication**: Child process spawn (Node.js ↔ Python)
- **Storage**: JSON file on disk (`server/models/ml_model.json`)

---

## Training Process

### Step-by-Step Training Flow

#### 1. **Trigger**
Training is triggered by:
- **Automatic**: Scheduler runs every 5 minutes
- **Manual**: API endpoint `POST /api/predict/train`
- **Initial**: 30 seconds after server startup

#### 2. **Data Collection** (`mlService.trainModel()`)

```javascript
// Fetch last 2500 sensor readings from MongoDB
const historicalData = await SensorLog.find({
  machineId: 'PM_001',
  temp_mean: { $exists: true, $ne: null },
  vib_rms: { $exists: true, $ne: null },
  current_rms: { $exists: true, $ne: null }
})
  .sort({ timestamp: -1 })
  .limit(2500)
  .select('temp_mean vib_rms current_rms edge_health timestamp')
  .lean();
```

**Requirements:**
- Minimum 100 samples required
- Must have all three features: `temp_mean`, `vib_rms`, `current_rms`
- Sorted by timestamp (newest first)

#### 3. **Data Preparation**

```javascript
// Transform MongoDB documents to training format
const trainingData = historicalData.map(d => ({
  temp_mean: d.temp_mean || 0,
  vib_rms: d.vib_rms || 0,
  current_rms: d.current_rms || 0,
  edge_health: d.edge_health || 0
}));
```

#### 4. **Python Script Execution** (`ml_train.py`)

**Input File** (temporary JSON):
```json
[
  { "temp_mean": 65.2, "vib_rms": 2.8, "current_rms": 4.5, "edge_health": 85 },
  { "temp_mean": 67.1, "vib_rms": 3.1, "current_rms": 5.2, "edge_health": 82 },
  ...
]
```

**Python Processing Steps:**

```python
# 1. Load and convert to DataFrame
df = pd.DataFrame(data)

# 2. Select features (only these 3 are used)
features = ['temp_mean', 'vib_rms', 'current_rms']
X = df[features].values

# 3. Standardize features (Z-score normalization)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
# Result: Mean = 0, Std = 1 for each feature

# 4. Train Isolation Forest
iso_forest = IsolationForest(
    n_estimators=100,      # 100 decision trees
    contamination=0.05,    # Expect 5% anomalies
    random_state=42,      # Reproducibility
    n_jobs=-1             # Use all CPU cores
)
iso_forest.fit(X_scaled)

# 5. Validate on training data
predictions = iso_forest.predict(X_scaled)
anomaly_rate = (predictions == -1).sum() / len(predictions)

# 6. Extract statistics
feature_means = scaler.mean_.tolist()  # [67.07, 3.18, 5.25]
feature_stds = scaler.scale_.tolist()  # [12.20, 1.45, 2.59]
```

**Output File** (temporary JSON):
```json
{
  "contamination": 0.05,
  "n_estimators": 100,
  "anomaly_threshold": -0.1,
  "feature_means": [67.07, 3.18, 5.25],
  "feature_stds": [12.20, 1.45, 2.59],
  "anomaly_rate": 0.048,
  "training_samples": 2500,
  "features": ["temp_mean", "vib_rms", "current_rms"]
}
```

#### 5. **Model Storage** (Node.js)

```javascript
// Store in memory
this.model = {
  contamination: 0.05,
  n_estimators: 100,
  anomaly_threshold: -0.1,
  feature_means: [67.07, 3.18, 5.25],
  feature_stds: [12.20, 1.45, 2.59]
};

this.scaler = {
  mean: [67.07, 3.18, 5.25],
  std: [12.20, 1.45, 2.59]
};

this.lastTrainingTime = new Date();

// Save to disk for persistence
this.saveModel(); // Writes to server/models/ml_model.json
```

#### 6. **Data Cleanup**

After successful training:
- Old sensor logs (beyond 500 most recent) are deleted to optimize storage
- Temporary training files are removed

#### 7. **Training Status**

```javascript
{
  isTrained: true,
  lastTrainingTime: "2026-01-02T10:30:00.000Z",
  isTraining: false
}
```

---

## Prediction Process

### Step-by-Step Prediction Flow

#### 1. **Input: New Sensor Reading**

When new sensor data arrives from Firebase:
```javascript
{
  temp_mean: 72.5,    // Temperature (Celsius)
  vib_rms: 3.8,       // Vibration RMS (mm/s)
  current_rms: 6.2,   // Current RMS (Amperes)
  edge_health: 75     // Edge device health score
}
```

#### 2. **Feature Normalization** (`mlService.predict()`)

```javascript
// Normalize using saved scaler statistics
const normalized = {
  temp_mean: (72.5 - 67.07) / 12.20 = 0.445,
  vib_rms: (3.8 - 3.18) / 1.45 = 0.428,
  current_rms: (6.2 - 5.25) / 2.59 = 0.367
};
```

**Why Normalize?**
- Features have different scales (temp: 50-80°C, vib: 1-5 mm/s, current: 2-8 A)
- Isolation Forest requires standardized features for accurate distance calculations
- Ensures all features contribute equally to anomaly detection

#### 3. **Python Prediction Script** (`ml_predict.py`)

**Input File** (temporary JSON):
```json
{
  "features": {
    "temp_mean": 0.445,
    "vib_rms": 0.428,
    "current_rms": 0.367
  },
  "model": {
    "contamination": 0.05,
    "anomaly_threshold": -0.1,
    "feature_means": [67.07, 3.18, 5.25],
    "feature_stds": [12.20, 1.45, 2.59]
  }
}
```

**Python Processing:**

```python
# 1. Reconstruct scaler
scaler = StandardScaler()
scaler.mean_ = np.array([67.07, 3.18, 5.25])
scaler.scale_ = np.array([12.20, 1.45, 2.59])

# 2. Prepare feature vector
feature_vector = np.array([[0.445, 0.428, 0.367]])

# 3. Normalize (already normalized, but double-check)
X_scaled = scaler.transform(feature_vector)

# 4. Calculate distance from mean (normalized)
distances = np.abs(X_scaled[0])  # [0.445, 0.428, 0.367]
max_distance = np.max(distances)  # 0.445

# 5. Calculate anomaly score
# Isolation Forest style: negative = normal, positive = anomaly
anomaly_score = -max_distance  # -0.445

# 6. Threshold-based prediction
threshold = -0.1
if anomaly_score > threshold:  # -0.445 > -0.1? No
    prediction = 1  # Anomaly
else:
    prediction = -1  # Normal

# 7. Convert to 0/1 format
anomaly = 1 if prediction == -1 else 0  # 0 (normal)

# 8. Normalize score to 0-1 range
normalized_score = max(0, min(1, (anomaly_score + 0.5) / 1.0))
# = max(0, min(1, (-0.445 + 0.5) / 1.0))
# = max(0, min(1, 0.055))
# = 0.055
```

**Output File** (temporary JSON):
```json
{
  "anomaly": 0,
  "anomaly_score": 0.055,
  "raw_score": -0.445
}
```

#### 4. **Post-Processing** (Node.js)

```javascript
// Calculate derived metrics
const healthScore = calculateHealthScore(features, result.anomaly);
const status = getStatus(result.anomaly, features);
const rul = calculateRUL(features, result.anomaly, healthScore);

// Final prediction result
{
  anomaly: 0,              // 0 = normal, 1 = anomaly
  anomaly_score: 0.055,    // 0-1 (higher = more anomalous)
  health_score: 75,         // 0-100 (higher = healthier)
  status: "degrading",      // "healthy" | "degrading" | "critical"
  rul_hours: 420           // Remaining Useful Life in hours
}
```

#### 5. **Storage**

Prediction results are saved to MongoDB:
```javascript
await SensorLog.create({
  machineId: 'PM_001',
  timestamp: new Date(),
  temp_mean: 72.5,
  vib_rms: 3.8,
  current_rms: 6.2,
  edge_health: 75,
  anomaly: 0,
  anomaly_score: 0.055
});
```

---

## Data Flow

### Complete Data Journey

```
┌─────────────┐
│   Firebase   │  Real-time sensor data
│  Firestore   │
└──────┬───────┘
       │
       │ HTTP POST /api/sensors/sync-firebase
       ▼
┌─────────────────────────────────────┐
│   Backend API (sensors.controller)  │
│   - Receives sensor data            │
│   - Validates and transforms        │
└──────┬──────────────────────────────┘
       │
       │ mlService.predict(features)
       ▼
┌─────────────────────────────────────┐
│      ML Service (mlService.js)       │
│   - Normalizes features              │
│   - Calls Python prediction script   │
│   - Calculates health score & RUL    │
└──────┬──────────────────────────────┘
       │
       │ Python subprocess
       ▼
┌─────────────────────────────────────┐
│   Python Script (ml_predict.py)     │
│   - Loads model parameters           │
│   - Calculates anomaly score         │
│   - Returns prediction               │
└──────┬──────────────────────────────┘
       │
       │ JSON result
       ▼
┌─────────────────────────────────────┐
│      ML Service (mlService.js)      │
│   - Processes prediction             │
│   - Calculates health metrics        │
└──────┬──────────────────────────────┘
       │
       │ Complete prediction object
       ▼
┌─────────────────────────────────────┐
│         MongoDB (SensorLog)          │
│   - Stores sensor reading            │
│   - Stores ML predictions             │
│   - Available for future training     │
└─────────────────────────────────────┘
```

### Training Data Flow

```
┌─────────────────────────────────────┐
│      Scheduler Service              │
│   - Triggers every 5 minutes         │
└──────┬──────────────────────────────┘
       │
       │ mlService.trainModel()
       ▼
┌─────────────────────────────────────┐
│         MongoDB (SensorLog)          │
│   - Fetches last 2500 readings       │
└──────┬──────────────────────────────┘
       │
       │ Historical data (JSON)
       ▼
┌─────────────────────────────────────┐
│      ML Service (mlService.js)       │
│   - Prepares training data           │
│   - Writes to temp file              │
└──────┬──────────────────────────────┘
       │
       │ Python subprocess
       ▼
┌─────────────────────────────────────┐
│   Python Script (ml_train.py)       │
│   - Trains Isolation Forest          │
│   - Extracts model parameters        │
└──────┬──────────────────────────────┘
       │
       │ Model parameters (JSON)
       ▼
┌─────────────────────────────────────┐
│      ML Service (mlService.js)       │
│   - Stores in memory                 │
│   - Saves to disk                    │
└──────┬──────────────────────────────┘
       │
       │
       ▼
┌─────────────────────────────────────┐
│   Model File (ml_model.json)        │
│   - Persistent storage               │
│   - Loaded on server restart         │
└─────────────────────────────────────┘
```

---

## Feature Engineering

### Input Features

The model uses **3 primary features** extracted from sensor readings:

| Feature | Description | Unit | Typical Range | Source |
|---------|-------------|------|---------------|--------|
| `temp_mean` | Average temperature | °C | 50-80 | Temperature sensor |
| `vib_rms` | Vibration RMS value | mm/s | 1-5 | Vibration sensor |
| `current_rms` | Current RMS value | A | 2-8 | Current sensor |

### Feature Selection Rationale

✅ **Why These Features?**
- **Temperature**: Indicates overheating, bearing wear, lubrication issues
- **Vibration**: Detects mechanical faults, misalignment, imbalance
- **Current**: Reveals electrical problems, motor issues, load variations

❌ **Why Not Others?**
- `edge_health`: Used for health score calculation, not anomaly detection
- Raw sensor values: RMS values are more stable and representative
- Derived features: Simplicity improves model interpretability

### Feature Preprocessing

1. **Missing Value Handling**: Replaced with 0 (fallback)
2. **Normalization**: Z-score standardization (mean=0, std=1)
3. **Outlier Handling**: Isolation Forest inherently handles outliers

### Feature Statistics Example

After training on 2500 samples:
```json
{
  "feature_means": [67.07, 3.18, 5.25],
  "feature_stds": [12.20, 1.45, 2.59]
}
```

**Interpretation:**
- Average temperature: 67.07°C (±12.20°C)
- Average vibration: 3.18 mm/s (±1.45 mm/s)
- Average current: 5.25 A (±2.59 A)

---

## Model Persistence

### Storage Location

```
server/models/ml_model.json
```

### File Structure

```json
{
  "model": {
    "contamination": 0.05,
    "n_estimators": 100,
    "anomaly_threshold": -0.1,
    "feature_means": [67.07, 3.18, 5.25],
    "feature_stds": [12.20, 1.45, 2.59]
  },
  "scaler": {
    "mean": [67.07, 3.18, 5.25],
    "std": [12.20, 1.45, 2.59]
  },
  "lastTrainingTime": "2026-01-02T10:30:00.000Z"
}
```

### Persistence Lifecycle

1. **Save**: After each successful training
   ```javascript
   mlService.saveModel(); // Called automatically
   ```

2. **Load**: On server startup
   ```javascript
   mlService.loadModel(); // Called in mlService.js:429
   ```

3. **Recovery**: If model file exists, it's loaded immediately
   - Model available for predictions right away
   - No need to wait for first training cycle

### What Persists?

✅ **Persists:**
- Model parameters (contamination, n_estimators, threshold)
- Feature statistics (means, standard deviations)
- Last training timestamp

❌ **Does NOT Persist:**
- Actual Isolation Forest trees (too large)
- Training data (stored in MongoDB)
- In-memory model object (reconstructed from parameters)

### Server Restart Behavior

```
Server Start
    │
    ├─► Load .env variables
    │
    ├─► Connect to MongoDB
    │
    ├─► Initialize MLService
    │
    ├─► mlService.loadModel()
    │   │
    │   ├─► Check if ml_model.json exists
    │   │
    │   ├─► YES: Load model parameters
    │   │   └─► Model ready for predictions
    │   │
    │   └─► NO: Model = null
    │       └─► Use fallback prediction until first training
    │
    └─► Start scheduler
        └─► First training after 30 seconds
```

---

## Health Score Calculation

### Algorithm

The health score is a **0-100 percentage** indicating equipment condition.

```javascript
calculateHealthScore(features, anomaly) {
  const { temp_mean, vib_rms, current_rms, edge_health } = features;
  
  // If anomaly detected, health is low
  if (anomaly === 1) {
    return Math.max(0, Math.min(50, edge_health - 30));
  }
  
  // Use edge_health if available
  if (edge_health > 0) {
    return Math.max(0, Math.min(100, edge_health));
  }
  
  // Calculate based on thresholds
  let score = 100;
  if (temp_mean > 60) score -= 20;
  if (vib_rms > 2.0) score -= 15;
  if (current_rms > 4.0) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}
```

### Health Score Ranges

| Score Range | Status | Meaning |
|-------------|--------|---------|
| 80-100 | Healthy | Equipment operating normally |
| 50-79 | Degrading | Early warning signs detected |
| 0-49 | Critical | Immediate attention required |

### Calculation Logic

1. **Anomaly Detected (anomaly = 1)**:
   - Health score = `max(0, min(50, edge_health - 30))`
   - Example: edge_health = 75 → health_score = 45

2. **Edge Health Available**:
   - Health score = `max(0, min(100, edge_health))`
   - Direct use of edge device calculation

3. **Threshold-Based**:
   - Start with 100
   - Subtract penalties:
     - Temperature > 60°C: -20 points
     - Vibration > 2.0 mm/s: -15 points
     - Current > 4.0 A: -10 points

### Example Calculations

**Example 1: Healthy Equipment**
```
temp_mean = 55°C, vib_rms = 1.5 mm/s, current_rms = 3.5 A
anomaly = 0, edge_health = 0

Score = 100 (no penalties)
Result: 100 (Healthy)
```

**Example 2: Degrading Equipment**
```
temp_mean = 65°C, vib_rms = 2.5 mm/s, current_rms = 4.5 A
anomaly = 0, edge_health = 0

Score = 100 - 20 (temp) - 15 (vib) - 10 (current) = 55
Result: 55 (Degrading)
```

**Example 3: Critical with Anomaly**
```
temp_mean = 75°C, vib_rms = 4.0 mm/s, current_rms = 7.0 A
anomaly = 1, edge_health = 60

Score = max(0, min(50, 60 - 30)) = 30
Result: 30 (Critical)
```

---

## Remaining Useful Life (RUL) Calculation

### Algorithm

RUL estimates **hours until equipment failure** based on current condition.

```javascript
calculateRUL(features, anomaly, healthScore) {
  // If anomaly detected, RUL is very low
  if (anomaly === 1) {
    return Math.max(1, Math.min(24, healthScore / 2));
  }
  
  // Base RUL from health score
  let baseRUL = 0;
  
  if (healthScore >= 80) {
    // Healthy: 720-1000 hours (1-1.5 months)
    baseRUL = 720 + ((healthScore - 80) / 20) * 280;
  } else if (healthScore >= 50) {
    // Degrading: 168-720 hours (1 week - 1 month)
    baseRUL = 168 + ((healthScore - 50) / 30) * 552;
  } else {
    // Critical: 24-168 hours (1 day - 1 week)
    baseRUL = 24 + ((healthScore - 0) / 50) * 144;
  }
  
  // Adjust based on feature severity
  let adjustment = 1.0;
  
  if (temp_mean > 70) adjustment *= 0.5;
  else if (temp_mean > 60) adjustment *= 0.7;
  
  if (vib_rms > 3.0) adjustment *= 0.6;
  else if (vib_rms > 2.0) adjustment *= 0.8;
  
  if (current_rms > 6.0) adjustment *= 0.5;
  else if (current_rms > 4.0) adjustment *= 0.8;
  
  const finalRUL = Math.round(baseRUL * adjustment);
  
  return Math.max(1, Math.min(1000, finalRUL));
}
```

### RUL Ranges by Health Score

| Health Score | Base RUL Range | Timeframe |
|--------------|----------------|-----------|
| 80-100 | 720-1000 hours | 1-1.5 months |
| 50-79 | 168-720 hours | 1 week - 1 month |
| 0-49 | 24-168 hours | 1 day - 1 week |
| Anomaly Detected | 1-24 hours | Immediate |

### Adjustment Factors

Feature-based adjustments reduce RUL based on severity:

| Condition | Adjustment Factor |
|-----------|------------------|
| temp_mean > 70°C | ×0.5 (50% reduction) |
| temp_mean > 60°C | ×0.7 (30% reduction) |
| vib_rms > 3.0 mm/s | ×0.6 (40% reduction) |
| vib_rms > 2.0 mm/s | ×0.8 (20% reduction) |
| current_rms > 6.0 A | ×0.5 (50% reduction) |
| current_rms > 4.0 A | ×0.8 (20% reduction) |

**Note**: Adjustments are **multiplicative** (compound effect).

### Example Calculations

**Example 1: Healthy Equipment**
```
healthScore = 90, anomaly = 0
temp_mean = 55°C, vib_rms = 1.5 mm/s, current_rms = 3.5 A

baseRUL = 720 + ((90 - 80) / 20) * 280 = 860 hours
adjustment = 1.0 (no penalties)
finalRUL = 860 hours ≈ 36 days
```

**Example 2: Degrading Equipment**
```
healthScore = 65, anomaly = 0
temp_mean = 65°C, vib_rms = 2.5 mm/s, current_rms = 4.5 A

baseRUL = 168 + ((65 - 50) / 30) * 552 = 444 hours
adjustment = 0.7 (temp) × 0.8 (vib) × 0.8 (current) = 0.448
finalRUL = 444 × 0.448 = 199 hours ≈ 8 days
```

**Example 3: Critical with Anomaly**
```
healthScore = 30, anomaly = 1
temp_mean = 75°C, vib_rms = 4.0 mm/s, current_rms = 7.0 A

RUL = max(1, min(24, 30 / 2)) = 15 hours
(Feature adjustments ignored when anomaly detected)
```

---

## Fallback Mechanisms

### When Fallback is Used

1. **Model Not Trained**: Insufficient training data (< 100 samples)
2. **Model Not Loaded**: Server restarted, no saved model file
3. **Python Script Failure**: Python not installed or script error
4. **Prediction Error**: Exception during prediction process

### Fallback Prediction Logic

```javascript
fallbackPrediction(features) {
  const { temp_mean = 0, vib_rms = 0, current_rms = 0 } = features;
  
  let anomaly = 0;
  let anomaly_score = 0;
  
  // Simple threshold-based detection
  if (temp_mean > 70 || vib_rms > 3.0 || current_rms > 6.0) {
    anomaly = 1;
    anomaly_score = 0.8;
  } else if (temp_mean > 60 || vib_rms > 2.0 || current_rms > 4.0) {
    anomaly_score = 0.3;
  }
  
  // Calculate health metrics using same logic
  const healthScore = calculateHealthScore(features, anomaly);
  const status = getStatus(anomaly, features);
  const rul = calculateRUL(features, anomaly, healthScore);
  
  return { anomaly, anomaly_score, health_score, status, rul_hours };
}
```

### Fallback Thresholds

| Feature | Critical Threshold | Warning Threshold |
|---------|-------------------|-------------------|
| Temperature | > 70°C | > 60°C |
| Vibration | > 3.0 mm/s | > 2.0 mm/s |
| Current | > 6.0 A | > 4.0 A |

### Graceful Degradation

✅ **System continues operating** even when ML model unavailable
- Predictions still generated (threshold-based)
- Health scores still calculated
- Alerts still triggered
- No service interruption

⚠️ **Limitations:**
- Less accurate than ML model
- No learning from historical patterns
- Fixed thresholds (not adaptive)

---

## Scheduling System

### Scheduler Service

Located in: `server/src/services/scheduler.js`

### Training Schedule

| Event | Timing | Description |
|-------|--------|-------------|
| Initial Training | 30 seconds after startup | First model training |
| Periodic Training | Every 5 minutes | Continuous learning |

### Scheduler Implementation

```javascript
scheduleMLTraining() {
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  const interval = setInterval(() => {
    logger.info('Scheduled ML model training triggered');
    mlService.trainModel('PM_001')
      .then(() => {
        logger.info('Scheduled ML model training completed');
      })
      .catch(err => {
        logger.error(`Scheduled ML training failed: ${err.message}`);
      });
  }, fiveMinutes);
  
  this.intervals.push(interval);
  logger.info(`ML training scheduled every 5 minutes`);
}
```

### Why 5 Minutes?

✅ **Advantages:**
- Fast adaptation to changing conditions
- Captures short-term patterns
- Keeps model current with latest data

⚠️ **Considerations:**
- Higher computational cost
- More frequent database queries
- May retrain on similar data

### Scheduler Lifecycle

```
Server Start
    │
    ├─► schedulerService.start()
    │   │
    │   ├─► scheduleMLTraining() (every 5 minutes)
    │   │
    │   └─► Initial training (after 30 seconds)
    │
    └─► Scheduler running...
        │
        ├─► Training #1 (30 seconds)
        ├─► Training #2 (5 minutes 30 seconds)
        ├─► Training #3 (10 minutes 30 seconds)
        └─► ... (continues every 5 minutes)
```

### Manual Training

You can trigger training manually via API:

```bash
POST /api/predict/train
```

**Response:**
```json
{
  "message": "ML model training started",
  "status": "training"
}
```

---

## Configuration Parameters

### Model Hyperparameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `n_estimators` | 100 | Number of decision trees in ensemble |
| `contamination` | 0.05 | Expected proportion of anomalies (5%) |
| `random_state` | 42 | Seed for reproducibility |
| `n_jobs` | -1 | Use all CPU cores for training |
| `anomaly_threshold` | -0.1 | Threshold for anomaly detection |

### Training Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| `training_samples` | 2500 | Maximum samples for training |
| `min_samples` | 100 | Minimum samples required |
| `retention_samples` | 500 | Keep this many after cleanup |
| `training_interval` | 5 minutes | Automatic retraining frequency |

### Feature Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| `features` | `['temp_mean', 'vib_rms', 'current_rms']` | Features used for training |
| `normalization` | StandardScaler (Z-score) | Feature scaling method |

### Health Score Thresholds

| Threshold | Value | Impact |
|-----------|-------|--------|
| Healthy | ≥ 80 | No penalties |
| Degrading | 50-79 | Warning state |
| Critical | < 50 | Alert state |
| Temp penalty | > 60°C | -20 points |
| Vib penalty | > 2.0 mm/s | -15 points |
| Current penalty | > 4.0 A | -10 points |

### RUL Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Min RUL | 1 hour | Minimum predicted lifetime |
| Max RUL | 1000 hours | Maximum predicted lifetime |
| Healthy base | 720-1000 hours | RUL for health score 80-100 |
| Degrading base | 168-720 hours | RUL for health score 50-79 |
| Critical base | 24-168 hours | RUL for health score 0-49 |
| Anomaly RUL | 1-24 hours | RUL when anomaly detected |

---

## File Structure

### ML-Related Files

```
sheild/
├── server/
│   ├── src/
│   │   ├── services/
│   │   │   ├── mlService.js          # Main ML service (Node.js)
│   │   │   ├── ml_train.py            # Python training script
│   │   │   ├── ml_predict.py          # Python prediction script
│   │   │   └── scheduler.js            # Training scheduler
│   │   ├── models/
│   │   │   └── SensorLog.js           # MongoDB schema
│   │   └── routes/
│   │       └── predict.js             # ML API endpoints
│   └── models/
│       └── ml_model.json              # Saved model parameters
```

### Key Files Explained

#### `mlService.js`
- **Purpose**: Main ML service wrapper
- **Responsibilities**:
  - Coordinates training and prediction
  - Manages model persistence
  - Calculates health scores and RUL
  - Handles fallback logic

#### `ml_train.py`
- **Purpose**: Python script for model training
- **Dependencies**: scikit-learn, numpy, pandas
- **Input**: JSON file with training data
- **Output**: JSON file with model parameters

#### `ml_predict.py`
- **Purpose**: Python script for anomaly prediction
- **Dependencies**: scikit-learn, numpy
- **Input**: JSON file with features and model parameters
- **Output**: JSON file with prediction results

#### `scheduler.js`
- **Purpose**: Automatic training scheduler
- **Responsibilities**:
  - Triggers training every 5 minutes
  - Initial training after server startup
  - Manages training intervals

#### `ml_model.json`
- **Purpose**: Persistent model storage
- **Location**: `server/models/ml_model.json`
- **Format**: JSON with model parameters and scaler statistics

---

## Summary

### How the ML Model Works

1. **Training**: Every 5 minutes, the model trains on the last 2500 sensor readings using Isolation Forest
2. **Persistence**: Model parameters are saved to disk and loaded on server restart
3. **Prediction**: New sensor readings are normalized and passed through the model to detect anomalies
4. **Health Metrics**: Health score and RUL are calculated based on predictions and feature values
5. **Continuous Learning**: The model adapts to changing equipment behavior patterns over time

### Key Takeaways

✅ **Model persists across server restarts** - Training progress is saved
✅ **Automatic retraining** - Model stays current with latest data
✅ **Graceful fallback** - System works even if ML model unavailable
✅ **Real-time predictions** - Fast anomaly detection on new sensor data
✅ **Health insights** - Provides health scores and RUL estimates

---

## Additional Resources

- **Isolation Forest Paper**: [Liu et al., 2008](https://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/icdm08b.pdf)
- **scikit-learn Documentation**: [Isolation Forest](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html)
- **Project ML Setup Guide**: `server/ML_SETUP.md`

---

**Last Updated**: 2026-01-02  
**Model Version**: 1.0  
**Algorithm**: Isolation Forest (scikit-learn)


