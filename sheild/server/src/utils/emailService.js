import nodemailer from 'nodemailer';

/**
 * Check if email credentials are configured
 * @returns {object} { configured: boolean, error?: string }
 */
export const checkEmailConfig = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    return {
      configured: false,
      error: `Email credentials not configured. EMAIL_USER: ${emailUser ? 'set' : 'missing'}, EMAIL_PASS: ${emailPass ? 'set' : 'missing'}. Please set EMAIL_USER and EMAIL_PASS in server/.env file and restart the server`
    };
  }
  
  const trimmedUser = emailUser.trim();
  const trimmedPass = emailPass.trim();
  
  if (!trimmedUser || !trimmedPass) {
    return {
      configured: false,
      error: 'Email credentials are empty after trimming whitespace. Please set valid EMAIL_USER and EMAIL_PASS in server/.env file'
    };
  }
  
  if (trimmedUser === 'your-email@gmail.com' || trimmedPass === 'your-app-password') {
    return {
      configured: false,
      error: 'Email credentials are using default placeholder values. Please set actual EMAIL_USER and EMAIL_PASS in server/.env file'
    };
  }
  
  return { configured: true };
};

/**
 * Create email transporter with defensive error handling
 * @returns {object} { transporter: object | null, error?: string }
 */
const createTransporter = () => {
  const configCheck = checkEmailConfig();
  if (!configCheck.configured) {
    return { transporter: null, error: configCheck.error };
  }
  
  const emailUser = process.env.EMAIL_USER.trim();
  let emailPass = process.env.EMAIL_PASS;
  
  if (emailPass) {
    emailPass = emailPass.replace(/\s/g, '').trim();
  }
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    return { transporter, error: null };
  } catch (error) {
    return { transporter: null, error: `Failed to create email transporter: ${error.message}` };
  }
};

/**
 * Send threshold alert email
 * @param {object} alertData - Alert data
 * @param {object} maintenanceHead - Maintenance head contact info
 * @returns {Promise<object>} { success: boolean, messageId?: string, error?: string }
 */
export const sendThresholdAlertEmail = async (alertData, maintenanceHead) => {
  try {
    const { transporter, error: configError } = createTransporter();
    
    if (!transporter) {
      console.warn('Email not sent - credentials not configured:', configError);
      return { success: false, error: configError };
    }
    
    if (!maintenanceHead || !maintenanceHead.email) {
      return { success: false, error: 'Maintenance head email not provided' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
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
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending threshold alert email:', error.message);
    console.error('Error code:', error.code);
    return { 
      success: false, 
      error: error.message || 'Failed to send email',
      code: error.code
    };
  }
};

/**
 * Send maintenance head notification email
 * @param {object} alertData - Alert data
 * @param {object} maintenanceHead - Maintenance head contact info
 * @returns {Promise<object>} { success: boolean, messageId?: string, error?: string }
 */
/**
 * Send feedback notification email to admin
 * @param {object} feedback - Feedback object
 * @returns {Promise<object>} { success: boolean, messageId?: string, error?: string }
 */
export const sendFeedbackNotificationEmail = async (feedback) => {
  try {
    console.log('[sendFeedbackNotificationEmail] Starting email send process...');
    console.log('[sendFeedbackNotificationEmail] Feedback ID:', feedback._id);
    console.log('[sendFeedbackNotificationEmail] Feedback type:', feedback.type);
    
    const { transporter, error: configError } = createTransporter();
    
    if (!transporter) {
      console.error('[sendFeedbackNotificationEmail] ✗ Transporter creation failed:', configError);
      return { success: false, error: configError };
    }
    
    console.log('[sendFeedbackNotificationEmail] ✓ Transporter created successfully');
    
    const adminEmail = process.env.EMAIL_USER; // Send to admin email
    if (!adminEmail) {
      console.error('[sendFeedbackNotificationEmail] ✗ Admin email not configured');
      return { success: false, error: 'Admin email not configured' };
    }
    
    console.log('[sendFeedbackNotificationEmail] Sending to:', adminEmail);
    
    const typeLabels = {
      bug: '🐛 Bug Report',
      feature: '✨ Feature Request',
      improvement: '💡 Improvement Suggestion',
      general: '💬 General Feedback',
      other: '📝 Other'
    };
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `📧 New Feedback: ${typeLabels[feedback.type] || 'Feedback'} - ${feedback.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #06b6d4, #14b8a6); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📧 New Feedback Received</h1>
            <p style="color: white; margin: 5px 0 0 0; font-size: 16px;">${typeLabels[feedback.type] || 'Feedback'}</p>
          </div>
          
          <div style="background-color: #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #60a5fa; margin-top: 0;">Feedback Details</h2>
            <p style="margin: 10px 0;"><strong style="color: #22d3ee;">Type:</strong> <span style="color: #e2e8f0;">${typeLabels[feedback.type] || feedback.type}</span></p>
            <p style="margin: 10px 0;"><strong style="color: #22d3ee;">Subject:</strong> <span style="color: #e2e8f0;">${feedback.title}</span></p>
            <p style="margin: 10px 0;"><strong style="color: #22d3ee;">From:</strong> <span style="color: #e2e8f0;">${feedback.name || 'Anonymous'}</span></p>
            <p style="margin: 10px 0;"><strong style="color: #22d3ee;">Email:</strong> <span style="color: #e2e8f0;">${feedback.email || 'Not provided'}</span></p>
            <p style="margin: 10px 0;"><strong style="color: #22d3ee;">Priority:</strong> <span style="color: #e2e8f0;">${feedback.priority || 'medium'}</span></p>
          </div>
          
          <div style="background-color: #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #60a5fa; margin-top: 0;">Message</h2>
            <div style="background-color: #1e293b; padding: 15px; border-radius: 5px; color: #e2e8f0; white-space: pre-wrap; line-height: 1.6;">
              ${feedback.description}
            </div>
          </div>
          
          <div style="background-color: #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #60a5fa; margin-top: 0;">Technical Details</h2>
            <p style="margin: 5px 0; color: #94a3b8; font-size: 12px;"><strong>Feedback ID:</strong> ${feedback._id}</p>
            <p style="margin: 5px 0; color: #94a3b8; font-size: 12px;"><strong>Submitted:</strong> ${new Date(feedback.createdAt).toLocaleString()}</p>
            ${feedback.browser ? `<p style="margin: 5px 0; color: #94a3b8; font-size: 12px;"><strong>Browser:</strong> ${feedback.browser}</p>` : ''}
            ${feedback.version ? `<p style="margin: 5px 0; color: #94a3b8; font-size: 12px;"><strong>App Version:</strong> ${feedback.version}</p>` : ''}
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #475569; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>This is an automated notification from SHIELD Industrial Monitoring System</p>
            <p>You can view and manage feedback in the admin panel</p>
          </div>
        </div>
      `
    };
    
    console.log('[sendFeedbackNotificationEmail] Mail options prepared, sending...');
    const result = await transporter.sendMail(mailOptions);
    console.log('[sendFeedbackNotificationEmail] ✓✓✓ Email sent successfully!');
    console.log('[sendFeedbackNotificationEmail] Message ID:', result.messageId);
    console.log('[sendFeedbackNotificationEmail] Response:', result.response);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[sendFeedbackNotificationEmail] ✗✗✗ ERROR sending email:');
    console.error('[sendFeedbackNotificationEmail] Error message:', error.message);
    console.error('[sendFeedbackNotificationEmail] Error code:', error.code);
    console.error('[sendFeedbackNotificationEmail] Error stack:', error.stack);
    return { 
      success: false, 
      error: error.message || 'Failed to send email',
      code: error.code
    };
  }
};

export const sendMaintenanceHeadNotification = async (alertData, maintenanceHead) => {
  try {
    const { transporter, error: configError } = createTransporter();
    
    if (!transporter) {
      console.warn('Email not sent - credentials not configured:', configError);
      return { success: false, error: configError };
    }
    
    if (!maintenanceHead || !maintenanceHead.email) {
      return { success: false, error: 'Maintenance head email not provided' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
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
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending maintenance notification email:', error.message);
    console.error('Error code:', error.code);
    return { 
      success: false, 
      error: error.message || 'Failed to send email',
      code: error.code
    };
  }
};
