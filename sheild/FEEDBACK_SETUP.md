# Feedback System Setup

## Where You Receive Feedback

### 1. Email Notifications
When someone submits feedback through the Help & Feedback page, you will receive an email notification at:
- **Email Address**: The email configured in `EMAIL_USER` in `server/.env`
- **Subject**: `📧 New Feedback: [Type] - [Subject]`
- **Content**: Includes all feedback details, user information, and technical details

### 2. MongoDB Database
All feedback is stored in MongoDB:
- **Collection**: `feedbacks`
- **Database**: `sheild_iot` (or your configured database)
- **Fields Stored**:
  - Name, Email, Type, Subject, Message
  - Priority, Status, Category
  - Timestamp, Browser info, App version
  - User ID (if logged in)

### 3. Admin API Endpoints
You can retrieve feedback via API:

```bash
# List all feedback (requires admin auth)
GET /api/feedback
Authorization: Bearer <admin_token>

# Get feedback statistics
GET /api/feedback/stats
Authorization: Bearer <admin_token>

# Get specific feedback
GET /api/feedback/:id
Authorization: Bearer <admin_token>
```

## Email Configuration

Make sure your email is configured in `server/.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Viewing Feedback

### Option 1: Check Your Email
- Check the inbox of the email address set in `EMAIL_USER`
- Each feedback submission triggers an email notification

### Option 2: MongoDB Compass / CLI
- Connect to MongoDB
- Navigate to `sheild_iot` database
- Open `feedbacks` collection
- View all submitted feedback

### Option 3: Create Admin Panel (Future)
You can create an admin panel page to view and manage feedback using the API endpoints.

## Feedback Types

- **Bug Report** 🐛 - Priority automatically set to "high"
- **Feature Request** ✨
- **Improvement Suggestion** 💡
- **General Feedback** 💬
- **Other** 📝

## Email Notification Details

The email includes:
- Feedback type and subject
- User name and email
- Full message content
- Priority level
- Feedback ID for tracking
- Submission timestamp
- Browser and version info

## Testing

1. Go to `/help` page
2. Click "Feedback" tab
3. Fill out the form
4. Submit
5. Check your email inbox (configured in `EMAIL_USER`)
6. Check MongoDB `feedbacks` collection





