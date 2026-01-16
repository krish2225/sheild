# Firebase Setup Guide (Firestore)

## Current Configuration
Your Firebase credentials are already configured in `.env` file:
- Project ID: `predictive-maintenance-m`
- Using: **Firestore** (Not Realtime Database)

## Issue: No Data Found

The error "No data found at path: devices/PM_001/live/latest" means:
1. ✅ Firebase is connecting successfully
2. ❌ No data exists at the expected Firestore path

## Solution: Add Data to Firestore

### Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `predictive-maintenance-m`
3. Click on **Firestore Database** in the left menu
4. Click on **Data** tab
5. Click **Start collection** (if no collections exist)
6. Create the following structure:

**Collection:** `devices`
- **Document ID:** `PM_001`
  - **Subcollection:** `live`
    - **Document ID:** `latest`
      - Add the following fields:
        - `device_id` (string): `PM_001`
        - `edge_health` (number): `85`
        - `features` (map):
          - `current_rms` (number): `2.1`
          - `temp_mean` (number): `45`
          - `vib_rms` (number): `1.2`
        - `timestamp` (number): `1735000000`

### Option 2: Using Firebase CLI

```bash
firebase firestore:set devices/PM_001/live/latest '{
  "device_id": "PM_001",
  "edge_health": 85,
  "features": {
    "current_rms": 2.1,
    "temp_mean": 45,
    "vib_rms": 1.2
  },
  "timestamp": 1735000000
}' --project predictive-maintenance-m
```

### Option 3: Update Firestore Rules

Make sure your Firestore Rules allow read access:

1. Go to Firebase Console → Firestore Database → Rules
2. Set rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devices/{deviceId}/live/latest {
      allow read, write: if true; // For development only
    }
  }
}
```

**Note:** For production, use more restrictive rules with authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devices/{deviceId}/live/latest {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## Verify Setup

After adding data:
1. Refresh your browser
2. Check browser console (F12) for Firebase logs
3. You should see: "Firestore data received: {device_id: 'PM_001', ...}"

## Test Data Structure

The app expects this exact structure at Firestore path: `devices/PM_001/live/latest`

**Firestore Document Structure:**
```
devices (collection)
  └── PM_001 (document)
      └── live (subcollection)
          └── latest (document)
              ├── device_id: "PM_001" (string)
              ├── edge_health: 85 (number)
              ├── features (map)
              │   ├── current_rms: 2.1 (number)
              │   ├── temp_mean: 45 (number)
              │   └── vib_rms: 1.2 (number)
              └── timestamp: 1735000000 (number)
```

## Troubleshooting

- **Permission Denied**: Update Firestore Rules (see Option 3 above)
- **Database not found**: Ensure Firestore Database is created (not Realtime Database)
- **Wrong path**: Verify the path is `devices/PM_001/live/latest` in Firestore
- **Data type mismatch**: Ensure numbers are stored as numbers, not strings

