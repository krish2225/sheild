import dotenv from 'dotenv';
import { connectToDatabase } from '../config/db.js';
import { createLogger } from '../config/logger.js';
import SensorLog from '../models/SensorLog.js';
import Machine from '../models/Machine.js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

dotenv.config();
const logger = createLogger();

/**
 * Import CSV data into MongoDB for ML training
 */
async function importCSV() {
  try {
    // Connect to database
    await connectToDatabase();
    logger.info('Connected to MongoDB');

    // Read CSV file
    const csvPath = process.argv[2] || '../../high_rpm_motor_10k.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    logger.info(`Reading CSV file: ${csvPath}`);

    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      cast: true
    });

    logger.info(`Found ${records.length} records in CSV`);

    // Get or create machine
    let machine = await Machine.findOne({ machineId: 'PM_001' });
    if (!machine) {
      machine = await Machine.create({
        machineId: 'PM_001',
        name: 'High RPM Motor',
        type: 'Motor',
        location: 'Factory Floor',
        status: 'normal',
        healthScore: 100
      });
      logger.info('Created machine PM_001');
    }

    // Process records
    const sensorLogs = [];
    let imported = 0;
    let skipped = 0;

    for (const record of records) {
      try {
        // Map CSV columns to our schema
        const temp_mean = parseFloat(record.Temperature) || 0;
        const vib_rms = parseFloat(record.Vibration) || 0;
        const current_rms = parseFloat(record.Current) || 0;
        const status = record.Status || 'Normal';
        const rul = parseFloat(record.RUL) || 0;

        // Calculate edge_health from RUL and status
        // RUL is in hours, convert to health score (0-100)
        // Higher RUL = better health
        // If status is Faulty, health is low
        let edge_health = 100;
        if (status === 'Faulty' || rul === 0) {
          edge_health = Math.random() * 30; // 0-30 for faulty
        } else {
          // Normalize RUL to 0-100 (assuming max RUL is around 30)
          edge_health = Math.min(100, Math.max(0, (rul / 30) * 100));
        }

        // Create timestamp (spread over last 30 days for realistic data)
        const daysAgo = Math.random() * 30;
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(Math.floor(Math.random() * 24));
        timestamp.setMinutes(Math.floor(Math.random() * 60));

        // Determine anomaly based on status
        const anomaly = status === 'Faulty' ? 1 : 0;

        sensorLogs.push({
          machine: machine._id,
          machineId: 'PM_001',
          timestamp,
          temp_mean,
          vib_rms,
          current_rms,
          edge_health,
          temperature: temp_mean,
          vibration: vib_rms,
          current: current_rms,
          anomaly,
          // Store original CSV data for reference
          features: {
            original_status: status,
            rul: rul
          }
        });

        imported++;
      } catch (error) {
        logger.warn(`Skipped record: ${error.message}`);
        skipped++;
      }
    }

    // Insert in batches
    const batchSize = 1000;
    logger.info(`Inserting ${sensorLogs.length} records in batches of ${batchSize}...`);

    for (let i = 0; i < sensorLogs.length; i += batchSize) {
      const batch = sensorLogs.slice(i, i + batchSize);
      await SensorLog.insertMany(batch, { ordered: false });
      logger.info(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sensorLogs.length / batchSize)}`);
    }

    logger.info(`Import complete! Imported: ${imported}, Skipped: ${skipped}`);
    logger.info(`Total records in database: ${await SensorLog.countDocuments({ machineId: 'PM_001' })}`);

    process.exit(0);
  } catch (error) {
    logger.error(`Import failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run import
importCSV();






