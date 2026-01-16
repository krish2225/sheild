# Firebase Integration Detailed Documentation

## Table of Contents
1. [Overview](#overview)
2. [File Location](#file-location)
3. [Firebase Configuration](#firebase-configuration)
4. [Initialization Process](#initialization-process)
5. [Functions Explained](#functions-explained)
6. [Data Structure](#data-structure)
7. [Real-time Subscription Flow](#real-time-subscription-flow)
8. [Usage Examples](#usage-examples)
9. [Error Handling](#error-handling)
10. [Integration with Backend](#integration-with-backend)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

---

## Overview

The `firebase.js` file is the **client-side Firebase integration service** for the SHIELD Predictive Maintenance System. It provides real-time data streaming from Firebase Firestore to the React frontend application.

### Key Features
- **Real-time Data Streaming**: Subscribes to live sensor data updates
- **Firestore Integration**: Uses Firebase Firestore (not Realtime Database)
- **Error Handling**: Graceful degradation when Firebase is unavailable
- **Configuration Management**: Environment variable-based configuration
- **Unsubscribe Support**: Clean resource management

### Technology Stack
- **Firebase SDK**: `firebase/app` and `firebase/firestore`
- **Framework**: React (used in components)
- **Build Tool**: Vite (environment variables)

---

## File Location

```
sheild/client/src/services/firebase.js
```

### Dependencies

```javascript
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, onSnapshot, getDoc } from 'firebase/firestore'
```

**Required Packages:**
- `firebase` (npm package)

---

## Firebase Configuration

### Configuration Object

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://your-project-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
}
```

### Environment Variables

All configuration values are loaded from environment variables prefixed with `VITE_` (Vite convention). These should be defined in `client/.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=predictive-maintenance-m.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://predictive-maintenance-m-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=predictive-maintenance-m
VITE_FIREBASE_STORAGE_BUCKET=predictive-maintenance-m.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Configuration Fields Explained

| Field | Description | Example |
|-------|-------------|---------|
| `apiKey` | Firebase API key for authentication | `AIzaSy...` |
| `authDomain` | Domain for Firebase Authentication | `project.firebaseapp.com` |
| `databaseURL` | Realtime Database URL (not used, but required) | `https://project-default-rtdb.firebaseio.com` |
| `projectId` | Firebase project identifier | `predictive-maintenance-m` |
| `storageBucket` | Cloud Storage bucket name | `project.appspot.com` |
| `messagingSenderId` | Cloud Messaging sender ID | `123456789` |
| `appId` | Firebase app identifier | `1:123456789:web:abcdef` |

### Fallback Values

If environment variables are not set, the code uses placeholder values (`"your-api-key"`, etc.). This allows the app to run without crashing, but Firebase will not function properly.

### Configuration Status Logging

```javascript
console.log('Firebase Config Status:', {
  hasApiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your-api-key',
  projectId: firebaseConfig.projectId,
  usingFirestore: true
})
```

This logs to the browser console to help debug configuration issues.

---

## Initialization Process

### Step-by-Step Initialization

```javascript
let app, db
try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  console.log('Firebase initialized:', {
    projectId: firebaseConfig.projectId,
    usingFirestore: true
  })
} catch (error) {
  console.error('Firebase initialization error:', error)
  console.error('Please ensure:')
  console.error('1. Firestore is enabled in Firebase Console')
  console.error('2. Firestore Rules allow read access')
  console.error('3. Project ID is correct:', firebaseConfig.projectId)
  // Don't throw - allow app to continue without Firebase
  db = null
}
```

### Initialization Flow

```
1. Create Firebase App
   │
   ├─► initializeApp(firebaseConfig)
   │   └─► Returns: Firebase App instance
   │
2. Get Firestore Database
   │
   ├─► getFirestore(app)
   │   └─► Returns: Firestore Database instance
   │
3. Store References
   │
   ├─► app = Firebase App instance
   └─► db = Firestore Database instance
```

### Error Handling

**Key Design Decision**: The code **does not throw errors** during initialization. Instead:
- Sets `db = null` if initialization fails
- Logs detailed error messages
- Allows the app to continue running (graceful degradation)

**Why?**
- The app can still function for other features
- Users can see error messages in the UI
- Prevents complete app crash

### Initialization Success Indicators

✅ **Success:**
- `app` is a Firebase App instance
- `db` is a Firestore Database instance
- Console log: "Firebase initialized"

❌ **Failure:**
- `db` is `null`
- Console error: "Firebase initialization error"
- App continues but Firebase features won't work

---

## Functions Explained

### 1. `subscribeToDeviceData(deviceId, callback)`

**Purpose**: Subscribe to real-time updates from a Firestore document.

**Signature:**
```javascript
export const subscribeToDeviceData = (deviceId = 'PM_001', callback) => {
  // Returns: Unsubscribe function
}
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `deviceId` | `string` | `'PM_001'` | Device identifier (e.g., 'PM_001') |
| `callback` | `function` | Required | Function called with data updates |

**Callback Signature:**
```javascript
callback(data, error)
```

- **`data`**: Document data object (or `null` if document doesn't exist)
- **`error`**: Error object (or `null` if no error)

**Returns:**
- **Unsubscribe function**: Call this to stop listening to updates

**Firestore Path Structure:**
```
devices/{deviceId}/live/latest
```

**Example Path:**
```
devices/PM_001/live/latest
```

**Breakdown:**
- `devices` - Collection
- `PM_001` - Document (device ID)
- `live` - Subcollection
- `latest` - Document (latest sensor reading)

### Function Flow

```javascript
export const subscribeToDeviceData = (deviceId = 'PM_001', callback) => {
  // 1. Check if Firestore is initialized
  if (!db) {
    console.warn('Firestore not initialized')
    callback(null, new Error('Firestore not initialized'))
    return () => {} // Return empty unsubscribe function
  }
  
  // 2. Create document reference
  const docRef = doc(db, 'devices', deviceId, 'live', 'latest')
  console.log('Subscribing to Firestore document:', `devices/${deviceId}/live/latest`)

  // 3. Set up real-time listener
  const unsubscribe = onSnapshot(docRef, 
    // Success callback
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        console.log('Firestore data received:', data)
        callback(data) // Call with data
      } else {
        console.warn(`No data found at Firestore path: devices/${deviceId}/live/latest`)
        callback(null) // Call with null (not an error)
      }
    },
    // Error callback
    (error) => {
      console.error('Firestore subscription error:', error)
      // Handle permission errors specifically
      if (error.code === 'permission-denied') {
        callback(null, new Error(`Permission denied. Please check Firestore Rules...`))
      } else {
        callback(null, error)
      }
    }
  )

  // 4. Return unsubscribe function
  return () => {
    unsubscribe()
  }
}
```

### Key Behaviors

1. **Document Exists**: Calls `callback(data)` with document data
2. **Document Doesn't Exist**: Calls `callback(null)` (not an error)
3. **Permission Error**: Calls `callback(null, permissionError)`
4. **Other Errors**: Calls `callback(null, error)`

### 2. `getDeviceData(deviceId)`

**Purpose**: Get current device data once (non-realtime fetch).

**Signature:**
```javascript
export const getDeviceData = async (deviceId = 'PM_001') => {
  // Returns: Promise<object>
}
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `deviceId` | `string` | `'PM_001'` | Device identifier |

**Returns:**
- **Promise** that resolves with document data
- **Throws** error if Firestore not initialized or document not found

**Function Flow:**

```javascript
export const getDeviceData = async (deviceId = 'PM_001') => {
  // 1. Check initialization
  if (!db) {
    throw new Error('Firestore not initialized')
  }
  
  // 2. Create document reference
  const docRef = doc(db, 'devices', deviceId, 'live', 'latest')
  
  // 3. Fetch document
  try {
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      return snapshot.data() // Return data
    } else {
      throw new Error(`No data found at Firestore path: devices/${deviceId}/live/latest`)
    }
  } catch (error) {
    throw error // Re-throw error
  }
}
```

### Differences: `subscribeToDeviceData` vs `getDeviceData`

| Feature | `subscribeToDeviceData` | `getDeviceData` |
|---------|------------------------|-----------------|
| **Type** | Real-time subscription | One-time fetch |
| **Returns** | Unsubscribe function | Promise |
| **Updates** | Automatic (when data changes) | Manual (call again) |
| **Use Case** | Live monitoring dashboards | Initial data load |
| **Resource Usage** | Continuous connection | Single request |

### 3. Exports

```javascript
export { db, app }
```

**Exported Variables:**
- `db`: Firestore Database instance (or `null` if initialization failed)
- `app`: Firebase App instance (or `undefined` if initialization failed)

**Usage:**
Other modules can import these to access Firebase directly:
```javascript
import { db, app } from './services/firebase'
```

---

## Data Structure

### Expected Firestore Document Structure

**Path:** `devices/PM_001/live/latest`

**Document Fields:**

```javascript
{
  device_id: "PM_001",           // String: Device identifier
  edge_health: 85,                // Number: Health score (0-100)
  features: {                     // Map/Object: Sensor features
    current_rms: 2.1,            // Number: Current RMS (Amperes)
    temp_mean: 45,               // Number: Temperature mean (°C)
    vib_rms: 1.2                 // Number: Vibration RMS (mm/s)
  },
  timestamp: 1735000000          // Number: Unix timestamp (seconds)
}
```

### Field Descriptions

| Field | Type | Description | Range/Format |
|-------|------|-------------|--------------|
| `device_id` | `string` | Device identifier | `"PM_001"` |
| `edge_health` | `number` | Edge device calculated health score | 0-100 |
| `features` | `object` | Sensor feature values | Object with 3 keys |
| `features.current_rms` | `number` | Root Mean Square current | 0-10 A (typical) |
| `features.temp_mean` | `number` | Mean temperature | 20-100°C (typical) |
| `features.vib_rms` | `number` | Root Mean Square vibration | 0-10 mm/s (typical) |
| `timestamp` | `number` | Unix timestamp in seconds | Unix epoch |

### Firestore Hierarchy

```
Firestore Database
└── devices (collection)
    └── PM_001 (document)
        ├── device_id: "PM_001"
        ├── edge_health: 85
        ├── features: {...}
        ├── timestamp: 1735000000
        └── live (subcollection)
            └── latest (document)
                ├── device_id: "PM_001"
                ├── edge_health: 85
                ├── features: {...}
                └── timestamp: 1735000000
```

**Note**: The actual structure uses a subcollection. The path `devices/PM_001/live/latest` means:
- Collection: `devices`
- Document: `PM_001`
- Subcollection: `live`
- Document: `latest`

### Data Type Requirements

⚠️ **Important**: Firestore is type-sensitive. Ensure:
- Numbers are stored as **numbers**, not strings
- Timestamps can be numbers (Unix seconds) or Firestore Timestamp objects
- Objects/maps are properly structured

---

## Real-time Subscription Flow

### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    IoT Device / Edge                        │
│                  (Sends sensor data)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP POST / WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Firebase Firestore Database                     │
│                                                               │
│  Path: devices/PM_001/live/latest                            │
│  Document updated with new sensor reading                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Real-time listener (onSnapshot)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         firebase.js: subscribeToDeviceData()                 │
│                                                               │
│  1. Creates document reference                               │
│  2. Sets up onSnapshot listener                              │
│  3. Listens for document changes                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ callback(data)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              React Component (e.g., Dashboard)                │
│                                                               │
│  1. Receives data in callback                                │
│  2. Updates component state                                  │
│  3. Triggers re-render with new data                         │
│  4. Optionally syncs to backend MongoDB                     │
└─────────────────────────────────────────────────────────────┘
```

### Subscription Lifecycle

```
Component Mount
    │
    ├─► subscribeToDeviceData('PM_001', callback)
    │   │
    │   ├─► Check if db is initialized
    │   │   ├─► NO: Return empty unsubscribe, call callback with error
    │   │   └─► YES: Continue
    │   │
    │   ├─► Create document reference
    │   │   doc(db, 'devices', 'PM_001', 'live', 'latest')
    │   │
    │   ├─► Set up onSnapshot listener
    │   │   │
    │   │   ├─► Document exists: callback(data)
    │   │   ├─► Document missing: callback(null)
    │   │   └─► Error: callback(null, error)
    │   │
    │   └─► Return unsubscribe function
    │
    ├─► Store unsubscribe function
    │
    └─► Component receives updates automatically
        │
        ├─► Data changes in Firestore
        ├─► onSnapshot triggers
        ├─► callback(data) called
        ├─► Component state updates
        └─► UI re-renders

Component Unmount
    │
    └─► Call unsubscribe()
        │
        └─► onSnapshot listener removed
            └─► No more updates received
```

### Real-time Update Behavior

**When Firestore document is updated:**
1. Firebase detects the change
2. `onSnapshot` callback is triggered
3. New document data is passed to the callback
4. React component updates state
5. UI re-renders with new data

**Update Frequency:**
- Updates occur **immediately** when Firestore document changes
- Typically **sub-second latency** (depends on network)
- No polling required (push-based, not pull-based)

---

## Usage Examples

### Example 1: Dashboard Component

```javascript
import { subscribeToDeviceData } from '../services/firebase'
import { useState, useEffect } from 'react'

function Dashboard() {
  const [deviceData, setDeviceData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let unsubscribe = null

    const setupSubscription = () => {
      unsubscribe = subscribeToDeviceData('PM_001', (data, err) => {
        if (err) {
          setError(err.message)
          return
        }

        if (data) {
          setDeviceData(data)
          setError(null)
        } else {
          // No data but no error (document doesn't exist)
          setError(null)
        }
      })
    }

    setupSubscription()

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!deviceData) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Device: {deviceData.device_id}</h1>
      <p>Health: {deviceData.edge_health}%</p>
      <p>Temperature: {deviceData.features.temp_mean}°C</p>
    </div>
  )
}
```

### Example 2: One-time Data Fetch

```javascript
import { getDeviceData } from '../services/firebase'
import { useState, useEffect } from 'react'

function DeviceInfo() {
  const [deviceData, setDeviceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDeviceData('PM_001')
        setDeviceData(data)
      } catch (error) {
        console.error('Failed to fetch device data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!deviceData) return <div>No data available</div>

  return <div>{/* Render device data */}</div>
}
```

### Example 3: Multiple Device Subscriptions

```javascript
import { subscribeToDeviceData } from '../services/firebase'
import { useState, useEffect } from 'react'

function MultiDeviceMonitor() {
  const [devices, setDevices] = useState({})

  useEffect(() => {
    const unsubscribes = []

    // Subscribe to multiple devices
    const deviceIds = ['PM_001', 'PM_002', 'PM_003']
    
    deviceIds.forEach(deviceId => {
      const unsubscribe = subscribeToDeviceData(deviceId, (data) => {
        if (data) {
          setDevices(prev => ({
            ...prev,
            [deviceId]: data
          }))
        }
      })
      unsubscribes.push(unsubscribe)
    })

    // Cleanup all subscriptions
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe())
    }
  }, [])

  return (
    <div>
      {Object.entries(devices).map(([deviceId, data]) => (
        <div key={deviceId}>
          <h2>{deviceId}</h2>
          <p>Health: {data.edge_health}%</p>
        </div>
      ))}
    </div>
  )
}
```

### Example 4: With Backend Sync

```javascript
import { subscribeToDeviceData } from '../services/firebase'
import api from '../utils/api'
import { useState, useEffect } from 'react'

function DashboardWithSync() {
  const [deviceData, setDeviceData] = useState(null)

  useEffect(() => {
    const unsubscribe = subscribeToDeviceData('PM_001', (data) => {
      if (data) {
        setDeviceData(data)

        // Sync to backend MongoDB
        api.post('/sensors/sync-firebase', {
          machineId: 'PM_001',
          data: {
            features: data.features || {},
            edge_health: data.edge_health || 0,
            timestamp: data.timestamp 
              ? new Date(data.timestamp * 1000).toISOString() 
              : new Date().toISOString()
          }
        }).catch(error => {
          console.error('Failed to sync to backend:', error)
        })
      }
    })

    return () => unsubscribe()
  }, [])

  return <div>{/* Render dashboard */}</div>
}
```

---

## Error Handling

### Error Types

#### 1. **Firestore Not Initialized**

**Cause**: Firebase initialization failed (invalid config, network issue, etc.)

**Detection:**
```javascript
if (!db) {
  console.warn('Firestore not initialized')
  callback(null, new Error('Firestore not initialized'))
  return () => {}
}
```

**Handling:**
- Check browser console for initialization errors
- Verify environment variables are set
- Ensure Firebase project exists

#### 2. **Permission Denied**

**Cause**: Firestore security rules don't allow read access

**Error Code:** `permission-denied`

**Detection:**
```javascript
if (error.code === 'permission-denied') {
  callback(null, new Error(`Permission denied. Please check Firestore Rules...`))
}
```

**Handling:**
- Update Firestore Rules in Firebase Console
- Allow read access for development:
  ```javascript
  match /devices/{deviceId}/live/latest {
    allow read: if true;
  }
  ```

#### 3. **Document Not Found**

**Cause**: Document doesn't exist at the specified path

**Behavior:**
- Not treated as an error
- `callback(null)` is called (no error parameter)
- Component should handle `null` data gracefully

**Detection:**
```javascript
if (snapshot.exists()) {
  callback(data)
} else {
  callback(null) // Not an error
}
```

#### 4. **Network Errors**

**Cause**: Internet connection issues, Firebase service unavailable

**Handling:**
- Error is passed to callback: `callback(null, error)`
- Component should display error message
- Subscription remains active (will reconnect automatically)

### Error Handling Best Practices

1. **Always check for errors in callback:**
   ```javascript
   subscribeToDeviceData('PM_001', (data, err) => {
     if (err) {
       // Handle error
       console.error(err)
       return
     }
     // Process data
   })
   ```

2. **Handle null data gracefully:**
   ```javascript
   if (data) {
     // Use data
   } else {
     // Show "No data available" message
   }
   ```

3. **Display user-friendly error messages:**
   ```javascript
   if (error) {
     return <div>Unable to connect to device. Please check your connection.</div>
   }
   ```

---

## Integration with Backend

### Data Flow: Firebase → Frontend → Backend

```
Firebase Firestore
    │
    │ Real-time update
    ▼
Frontend (firebase.js)
    │
    │ subscribeToDeviceData callback
    ▼
React Component
    │
    │ API POST request
    ▼
Backend API (/api/sensors/sync-firebase)
    │
    │ Save to MongoDB + ML prediction
    ▼
MongoDB (SensorLog collection)
```

### Backend Sync Endpoint

**Endpoint:** `POST /api/sensors/sync-firebase`

**Request Body:**
```javascript
{
  machineId: "PM_001",
  data: {
    features: {
      temp_mean: 45,
      vib_rms: 1.2,
      current_rms: 2.1
    },
    edge_health: 85,
    timestamp: "2026-01-02T10:30:00.000Z"
  }
}
```

**Backend Processing:**
1. Validates machine exists
2. Extracts features from Firebase data
3. Runs ML prediction
4. Saves to MongoDB SensorLog collection
5. Returns success/error response

### Why Sync to Backend?

1. **Historical Storage**: MongoDB stores all sensor readings for ML training
2. **ML Predictions**: Backend runs anomaly detection and health calculations
3. **Data Persistence**: Firestore `latest` document is overwritten; MongoDB keeps history
4. **Analytics**: Backend can analyze trends over time

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Firestore not initialized"

**Symptoms:**
- Console warning: "Firestore not initialized"
- Callback receives error: "Firestore not initialized"

**Solutions:**
1. Check environment variables in `client/.env`
2. Verify all `VITE_FIREBASE_*` variables are set
3. Restart development server after changing `.env`
4. Check browser console for initialization errors

#### Issue 2: "Permission denied"

**Symptoms:**
- Console error: "permission-denied"
- Callback receives permission error

**Solutions:**
1. Go to Firebase Console → Firestore Database → Rules
2. Update rules to allow read access:
   ```javascript
   match /devices/{deviceId}/live/latest {
     allow read: if true; // Development only
   }
   ```
3. For production, use authentication-based rules

#### Issue 3: "No data found"

**Symptoms:**
- Console warning: "No data found at Firestore path"
- Callback receives `null` data (no error)

**Solutions:**
1. Verify document exists at `devices/PM_001/live/latest`
2. Check Firebase Console → Firestore Database → Data
3. Ensure document has required fields:
   - `device_id`
   - `edge_health`
   - `features` (with `temp_mean`, `vib_rms`, `current_rms`)
   - `timestamp`

#### Issue 4: Data not updating in real-time

**Symptoms:**
- Initial data loads, but updates don't appear
- Component doesn't re-render on Firestore changes

**Solutions:**
1. Verify `onSnapshot` is set up correctly
2. Check that unsubscribe is not called prematurely
3. Ensure component is still mounted
4. Check browser console for Firestore errors
5. Verify Firestore document is actually being updated

#### Issue 5: Environment variables not loading

**Symptoms:**
- Firebase config shows placeholder values
- "your-api-key", "your-project-id" in console

**Solutions:**
1. Ensure `.env` file is in `client/` directory (not `sheild/`)
2. Variables must start with `VITE_` prefix
3. Restart Vite dev server after changing `.env`
4. Check `.env` file syntax (no spaces around `=`)
5. Verify `.env` is not in `.gitignore` (or create `.env.local`)

### Debug Checklist

- [ ] Firebase project exists and is active
- [ ] Firestore Database is created (not just Realtime Database)
- [ ] Environment variables are set in `client/.env`
- [ ] Vite dev server was restarted after `.env` changes
- [ ] Firestore Rules allow read access
- [ ] Document exists at correct path: `devices/PM_001/live/latest`
- [ ] Document has correct field types (numbers, not strings)
- [ ] Browser console shows "Firebase initialized" message
- [ ] Network tab shows Firestore requests (not blocked)

---

## Best Practices

### 1. Always Unsubscribe

**Why:** Prevents memory leaks and unnecessary network requests

**How:**
```javascript
useEffect(() => {
  const unsubscribe = subscribeToDeviceData('PM_001', callback)
  return () => unsubscribe() // Cleanup on unmount
}, [])
```

### 2. Handle Errors Gracefully

**Why:** Provides better user experience

**How:**
```javascript
subscribeToDeviceData('PM_001', (data, err) => {
  if (err) {
    // Show user-friendly error message
    setError('Unable to connect to device')
    return
  }
  // Process data
})
```

### 3. Check for Null Data

**Why:** Document might not exist yet

**How:**
```javascript
if (data) {
  // Use data
} else {
  // Show "No data available" or loading state
}
```

### 4. Avoid Unnecessary Re-renders

**Why:** Improves performance

**How:**
```javascript
setDeviceData(prev => {
  if (prev && prev.timestamp === data.timestamp) {
    return prev // Don't update if timestamp unchanged
  }
  return data
})
```

### 5. Use Environment Variables

**Why:** Keeps credentials secure and configurable

**How:**
- Store all Firebase config in `client/.env`
- Use `VITE_` prefix for Vite variables
- Never commit `.env` to version control

### 6. Log for Debugging

**Why:** Helps identify issues during development

**How:**
```javascript
console.log('Firestore data received:', data)
console.log('Subscribing to:', `devices/${deviceId}/live/latest`)
```

### 7. Sync to Backend Asynchronously

**Why:** Doesn't block UI updates

**How:**
```javascript
if (data) {
  setDeviceData(data) // Update UI immediately
  
  // Sync to backend (don't await)
  api.post('/sensors/sync-firebase', {...})
    .catch(err => console.error('Sync failed:', err))
}
```

---

## Summary

### Key Takeaways

1. **Real-time Updates**: `subscribeToDeviceData` provides live data streaming from Firestore
2. **Configuration**: Uses environment variables for Firebase credentials
3. **Error Handling**: Graceful degradation when Firebase is unavailable
4. **Resource Management**: Always unsubscribe to prevent memory leaks
5. **Backend Integration**: Frontend syncs data to backend for ML processing and storage

### File Responsibilities

- **Initialization**: Sets up Firebase App and Firestore Database
- **Real-time Subscription**: Provides `subscribeToDeviceData` function
- **One-time Fetch**: Provides `getDeviceData` function
- **Error Handling**: Manages Firebase errors gracefully
- **Configuration**: Loads Firebase config from environment variables

### Integration Points

- **React Components**: Import and use `subscribeToDeviceData`
- **Backend API**: Frontend calls `/api/sensors/sync-firebase` with Firebase data
- **MongoDB**: Backend stores Firebase data for historical analysis and ML training

---

**Last Updated**: 2026-01-02  
**File**: `sheild/client/src/services/firebase.js`  
**Firebase SDK Version**: 10.x (Firebase v9+ modular SDK)


