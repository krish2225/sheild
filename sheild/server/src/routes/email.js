import { Router } from 'express';
import { sendThresholdAlertEmail } from '../utils/emailService.js';

const router = Router();

/**
 * POST /api/email/test
 * 
 * Test email endpoint to verify email configuration
 * 
 * Request body:
 * {
 *   "to": "recipient@example.com"
 * }
 */
router.post('/test', async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: to (recipient email)'
      });
    }

    // Create test alert data
    const testAlertData = {
      machineId: 'PM_001',
      thresholdType: 'temperature',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      thresholdValue: 90,
      sensorReadings: {
        temperature: 95,
        vibration: 30,
        current: 15,
        healthScore: 45
      }
    };

    const testMaintenanceHead = {
      email: to,
      name: 'Test Recipient'
    };

    // Send test email
    const result = await sendThresholdAlertEmail(testAlertData, testMaintenanceHead);

    if (!result.success) {
      // Determine appropriate status code based on error type
      let statusCode = 500;
      let errorMessage = result.error || 'Failed to send test email';
      
      if (result.error && result.error.includes('not configured')) {
        statusCode = 400;
      } else if (result.code === 'EAUTH' || result.code === 'EENVELOPE') {
        statusCode = 401;
        errorMessage = 'Email authentication failed. Please check your EMAIL_USER and EMAIL_PASS credentials.';
      } else if (result.code === 'ECONNECTION' || result.code === 'ETIMEDOUT') {
        statusCode = 503;
        errorMessage = 'Email service connection failed. Please check your internet connection.';
      }
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: result.error,
        code: result.code,
        hint: result.error && result.error.includes('not configured') 
          ? 'Please set EMAIL_USER and EMAIL_PASS in server/.env file and restart the server'
          : result.code === 'EAUTH' 
          ? 'For Gmail: 1) Enable 2-Factor Authentication, 2) Generate an App Password, 3) Use the App Password in EMAIL_PASS'
          : 'Check the backend console logs for more details'
      });
    }

    res.json({
      success: true,
      message: `Test email sent successfully to ${to}`,
      data: {
        from: process.env.EMAIL_USER,
        to: to,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    // Fallback for unexpected errors
    console.error('Unexpected error in test email endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Unexpected error occurred',
      error: error.message || 'Unknown error',
      hint: 'Check the backend console logs for more details'
    });
  }
});

export default router;

