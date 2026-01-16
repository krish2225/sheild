import { createLogger } from '../config/logger.js';
import { mlService } from './mlService.js';

const logger = createLogger();

/**
 * Scheduler service for periodic ML model training
 */
class SchedulerService {
  constructor() {
    this.intervals = [];
    this.isRunning = false;
  }

  /**
   * Start all scheduled tasks
   */
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting scheduler service');

    // Train ML model every 5 minutes
    this.scheduleMLTraining();

    // Initial training after 30 seconds (to allow server to start)
    setTimeout(() => {
      mlService.trainModel('PM_001').catch(err => {
        logger.error(`Initial ML training failed: ${err.message}`);
      });
    }, 30000); // 30 seconds delay
  }

  /**
   * Schedule ML model training every 5 minutes
   */
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

  /**
   * Stop all scheduled tasks
   */
  stop() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.isRunning = false;
    logger.info('Scheduler service stopped');
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeIntervals: this.intervals.length,
      mlModelStatus: mlService.getModelStatus()
    };
  }
}

// Export singleton instance
export const schedulerService = new SchedulerService();

