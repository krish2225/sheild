# Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Environment Setup
- [ ] Create production `.env` file in `server/` directory
- [ ] Create production `.env` file in `client/` directory
- [ ] Set `NODE_ENV=production` in server `.env`
- [ ] Generate strong `JWT_SECRET` (64+ characters)
- [ ] Configure production `MONGO_URI` with authentication
- [ ] Set `CLIENT_ORIGIN` to your production domain
- [ ] Configure `EMAIL_USER` and `EMAIL_PASS` for Gmail
- [ ] Set `VITE_API_URL` to production API URL
- [ ] Set `VITE_SOCKET_URL` to production Socket.IO URL

### Security
- [ ] Change default admin password (if using seed data)
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Remove any hardcoded credentials
- [ ] Enable MongoDB authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Review CORS settings
- [ ] Enable rate limiting (if applicable)

### Database
- [ ] Create production MongoDB database
- [ ] Set up MongoDB user with proper permissions
- [ ] Configure MongoDB backups
- [ ] Test database connection
- [ ] Run seed script (optional, for initial data)

### Dependencies
- [ ] Install Node.js 20+ on server
- [ ] Install Python 3.10+ for ML services
- [ ] Run `npm install --production` in server/
- [ ] Run `npm install` in client/
- [ ] Run `pip install -r server/requirements.txt`

### Build
- [ ] Run `npm run build` in client/
- [ ] Verify `client/dist/` directory exists
- [ ] Test production build locally (optional)

## Deployment

### Server Setup
- [ ] Deploy server code to production server
- [ ] Copy `.env` file to server directory
- [ ] Start server: `npm start` or use PM2/systemd
- [ ] Verify server is running on correct port
- [ ] Check server logs for errors

### Frontend Setup
- [ ] Deploy frontend build (`client/dist/`) to hosting
- [ ] Configure web server (Nginx/Apache) if needed
- [ ] Set up routing for SPA (all routes to index.html)
- [ ] Verify frontend loads correctly

### Network Configuration
- [ ] Configure DNS records
- [ ] Set up reverse proxy (if using Nginx)
- [ ] Configure SSL certificates
- [ ] Test HTTPS connection
- [ ] Verify CORS is working

## Post-Deployment

### Testing
- [ ] Test health endpoint: `/health`
- [ ] Test API endpoints
- [ ] Test login functionality
- [ ] Test Dashboard loads
- [ ] Test real-time data updates
- [ ] Test Socket.IO connection
- [ ] Test ML predictions
- [ ] Test email notifications
- [ ] Test feedback submission

### Monitoring
- [ ] Set up error tracking
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring
- [ ] Monitor server resources (CPU, memory, disk)
- [ ] Monitor database performance
- [ ] Set up alerts for critical errors

### Documentation
- [ ] Document production URLs
- [ ] Document admin credentials (securely)
- [ ] Document environment variables
- [ ] Create runbook for common issues

## Maintenance

### Regular Tasks
- [ ] Schedule regular database backups
- [ ] Monitor disk space (especially ML model storage)
- [ ] Review and rotate logs
- [ ] Update dependencies regularly
- [ ] Renew SSL certificates
- [ ] Review security patches

### Backup Strategy
- [ ] Set up automated MongoDB backups
- [ ] Test backup restoration process
- [ ] Store backups securely (off-site)
- [ ] Document backup procedures

## Rollback Plan

- [ ] Document rollback procedure
- [ ] Keep previous version available
- [ ] Test rollback process
- [ ] Document database migration rollback (if applicable)

## Emergency Contacts

- [ ] Document server access credentials (securely)
- [ ] Document database access credentials (securely)
- [ ] Document hosting provider support contacts
- [ ] Document team contact information

---

## Quick Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test MongoDB Connection
```bash
mongosh "mongodb://user:pass@host:27017/sheild_iot?authSource=admin"
```

### Check Server Status
```bash
# PM2
pm2 status
pm2 logs shield-backend

# Systemd
sudo systemctl status shield-backend
sudo journalctl -u shield-backend -f
```

### Restart Services
```bash
# PM2
pm2 restart shield-backend

# Systemd
sudo systemctl restart shield-backend

# Docker
docker-compose restart
```





