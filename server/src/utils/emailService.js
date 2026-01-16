import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your preferred email service
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

export const sendThresholdAlertEmail = async (alertData, maintenanceHead) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: maintenanceHead.email,
      subject: `🚨 URGENT: Threshold Alert - ${alertData.machineId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚨 CRITICAL ALERT</h1>
            <p style="color: white; margin: 5px 0 0 0; font-size: 16px;">Machine Threshold Exceeded</p>
          </div>
          
          <div style="background-color: #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #60a5fa; margin-top: 0;">Machine Details</h2>
            <p><strong>Machine ID:</strong> ${alertData.machineId}</p>
            <p><strong>Alert Type:</strong> ${alertData.thresholdType}</p>
            <p><strong>Severity:</strong> <span style="color: ${alertData.severity === 'critical' ? '#ef4444' : '#f97316'}">${alertData.severity.toUpperCase()}</span></p>
            <p><strong>Time:</strong> ${new Date(alertData.timestamp).toLocaleString()}</p>
          </div>
          
          <div style="background-color: #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #60a5fa; margin-top: 0;">Sensor Readings</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="background-color: #1e293b; padding: 10px; border-radius: 5px;">
                <p style="margin: 0; color: #22d3ee;"><strong>Temperature:</strong> ${alertData.sensorReadings.temperature}°C</p>
              </div>
              <div style="background-color: #1e293b; padding: 10px; border-radius: 5px;">
                <p style="margin: 0; color: #22d3ee;"><strong>Vibration:</strong> ${alertData.sensorReadings.vibration} mm/s</p>
              </div>
              <div style="background-color: #1e293b; padding: 10px; border-radius: 5px;">
                <p style="margin: 0; color: #34d399;"><strong>Current:</strong> ${alertData.sensorReadings.current} A</p>
              </div>
              <div style="background-color: #1e293b; padding: 10px; border-radius: 5px;">
                <p style="margin: 0; color: #f59e0b;"><strong>Health Score:</strong> ${alertData.sensorReadings.healthScore}</p>
              </div>
            </div>
          </div>
          
          <div style="background-color: #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #60a5fa; margin-top: 0;">Threshold Information</h2>
            <p><strong>Threshold Value:</strong> ${alertData.thresholdValue}</p>
            <p><strong>Current Value:</strong> ${alertData.sensorReadings[alertData.thresholdType]}</p>
            <p><strong>Exceeded By:</strong> ${(alertData.sensorReadings[alertData.thresholdType] - alertData.thresholdValue).toFixed(2)}</p>
          </div>
          
          <div style="background-color: #dc2626; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="color: white; margin: 0; font-weight: bold;">⚠️ IMMEDIATE ACTION REQUIRED ⚠️</p>
            <p style="color: white; margin: 5px 0 0 0;">Please investigate this machine immediately</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #475569; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>This is an automated alert from SHIELD Industrial Monitoring System</p>
            <p>Generated at ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendMaintenanceHeadNotification = async (alertData, maintenanceHead) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: maintenanceHead.email,
      subject: `🔧 Maintenance Alert - ${alertData.machineId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #f97316, #eab308); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔧 MAINTENANCE ALERT</h1>
            <p style="color: white; margin: 5px 0 0 0; font-size: 16px;">Machine Requires Attention</p>
          </div>
          
          <div style="background-color: #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #60a5fa; margin-top: 0;">Machine Information</h2>
            <p><strong>Machine ID:</strong> ${alertData.machineId}</p>
            <p><strong>Alert Message:</strong> ${alertData.message}</p>
            <p><strong>Severity:</strong> <span style="color: ${alertData.severity === 'critical' ? '#ef4444' : '#f97316'}">${alertData.severity.toUpperCase()}</span></p>
            <p><strong>Timestamp:</strong> ${new Date(alertData.timestamp).toLocaleString()}</p>
          </div>
          
          <div style="background-color: #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #60a5fa; margin-top: 0;">Current Sensor Data</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="background-color: #1e293b; padding: 10px; border-radius: 5px;">
                <p style="margin: 0; color: #22d3ee;"><strong>Temperature:</strong> ${alertData.sensorReadings.temperature}°C</p>
              </div>
              <div style="background-color: #1e293b; padding: 10px; border-radius: 5px;">
                <p style="margin: 0; color: #22d3ee;"><strong>Vibration:</strong> ${alertData.sensorReadings.vibration} mm/s</p>
              </div>
              <div style="background-color: #1e293b; padding: 10px; border-radius: 5px;">
                <p style="margin: 0; color: #34d399;"><strong>Current:</strong> ${alertData.sensorReadings.current} A</p>
              </div>
              <div style="background-color: #1e293b; padding: 10px; border-radius: 5px;">
                <p style="margin: 0; color: #f59e0b;"><strong>Health Score:</strong> ${alertData.sensorReadings.healthScore}</p>
              </div>
            </div>
          </div>
          
          <div style="background-color: #f97316; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="color: white; margin: 0; font-weight: bold;">🔧 MAINTENANCE REQUIRED</p>
            <p style="color: white; margin: 5px 0 0 0;">Please schedule maintenance for this machine</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #475569; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>This is an automated notification from SHIELD Industrial Monitoring System</p>
            <p>Generated at ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Maintenance notification email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending maintenance notification email:', error);
    throw error;
  }
};
