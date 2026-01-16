# SHIELD Industrial Monitoring System

## Email Configuration Setup

To enable email notifications for threshold alerts, you need to configure email settings in your environment variables.

### Required Environment Variables

Add these to your `server/.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password (not your regular Gmail password)

### Alternative Email Services

You can modify the email service in `server/src/utils/emailService.js`:

- **Outlook/Hotmail**: Change `service: 'gmail'` to `service: 'hotmail'`
- **Yahoo**: Change `service: 'gmail'` to `service: 'yahoo'`
- **Custom SMTP**: Configure manually with host, port, and security options

### Testing Email Notifications

1. Set up a machine with maintenance head email in the Thresholds page
2. Configure threshold values
3. When sensor readings exceed thresholds, emails will be automatically sent

### Features Implemented

✅ **Email Notifications**: Automatic emails to maintenance heads when thresholds are crossed
✅ **Software/Hardware Classification**: Bug reports now include classification field
✅ **Developer Footer**: Footer with developer names (Krish Namboodri, Fardin Pirjade, Utkarsh Sakpal)
✅ **SHIELD Logo**: Custom logo matching the provided design with gradient shield and lightning bolt

### Email Templates

The system includes two types of email notifications:
- **Threshold Alert**: Critical alerts with detailed sensor readings
- **Maintenance Alert**: General maintenance notifications

Both emails include:
- Machine information
- Sensor readings (temperature, vibration, current, health score)
- Threshold information
- Timestamp
- Professional HTML formatting
