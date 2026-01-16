# SHIELD - Deployment Guide

## Pre-Deployment Checklist

### ✅ Environment Variables

#### Server (.env)
- [ ] `PORT` - Server port (default: 5000)
- [ ] `NODE_ENV=production` - Set to production
- [ ] `MONGO_URI` - Production MongoDB connection string
- [ ] `JWT_SECRET` - Strong secret key (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] `CLIENT_ORIGIN` - Your frontend domain (e.g., `https://yourdomain.com`)
- [ ] `EMAIL_USER` - Gmail address for notifications
- [ ] `EMAIL_PASS` - Gmail App Password

#### Client (.env)
- [ ] `VITE_API_URL` - Backend API URL (e.g., `https://api.yourdomain.com/api`)
- [ ] `VITE_SOCKET_URL` - Socket.IO URL (e.g., `https://api.yourdomain.com`)

### ✅ Security Checklist
- [ ] Change default JWT_SECRET
- [ ] Use strong MongoDB credentials
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Remove or secure admin credentials
- [ ] Enable rate limiting (recommended)
- [ ] Set up firewall rules
- [ ] Enable MongoDB authentication

### ✅ Database Setup
- [ ] Create production MongoDB database
- [ ] Set up MongoDB authentication
- [ ] Configure MongoDB backups
- [ ] Run seed script: `npm run seed` (optional, for initial data)

### ✅ Dependencies
- [ ] Install Node.js 20+ on server
- [ ] Install Python 3.10+ for ML services
- [ ] Install Python dependencies: `pip install -r server/requirements.txt`
- [ ] Install Node dependencies: `npm install` in both client and server

---

## Deployment Options

### Option 1: Traditional Server Deployment

#### Prerequisites
- VPS/Server with Node.js 20+, Python 3.10+, MongoDB 7+
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

#### Steps

1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd shield/sheild
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install --production
   cp .env.example .env
   # Edit .env with production values
   npm run seed  # Optional: seed initial data
   ```

3. **Frontend Build**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Edit .env with production API URLs
   npm run build
   # Output will be in client/dist/
   ```

4. **Start Backend**
   ```bash
   cd ../server
   npm start
   # Or use PM2: pm2 start src/index.js --name shield-backend
   ```

5. **Serve Frontend**
   - Option A: Use Nginx to serve `client/dist/`
   - Option B: Use a static hosting service (Vercel, Netlify, etc.)

#### Nginx Configuration Example

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/client/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### Option 2: Docker Deployment

#### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional)

#### Steps

1. **Update docker-compose.yml**
   ```yaml
   services:
     mongo:
       image: mongo:7
       environment:
         MONGO_INITDB_ROOT_USERNAME: admin
         MONGO_INITDB_ROOT_PASSWORD: your-secure-password
       volumes:
         - mongo_data:/data/db
     
     server:
       build: ./server
       environment:
         - NODE_ENV=production
         - PORT=5000
         - MONGO_URI=mongodb://admin:your-secure-password@mongo:27017/sheild_iot?authSource=admin
         - JWT_SECRET=your-jwt-secret
         - CLIENT_ORIGIN=https://yourdomain.com
         - EMAIL_USER=your-email@gmail.com
         - EMAIL_PASS=your-app-password
     
     client:
       build: ./client
       environment:
         - VITE_API_URL=https://api.yourdomain.com/api
         - VITE_SOCKET_URL=https://api.yourdomain.com
   ```

2. **Build and Start**
   ```bash
   docker-compose up -d --build
   ```

3. **Seed Database (Optional)**
   ```bash
   docker-compose exec server npm run seed
   ```

---

### Option 3: Cloud Platform Deployment

#### Vercel/Netlify (Frontend) + Railway/Render (Backend)

**Frontend (Vercel/Netlify)**
1. Connect your repository
2. Set build command: `cd client && npm install && npm run build`
3. Set output directory: `client/dist`
4. Add environment variables:
   - `VITE_API_URL`
   - `VITE_SOCKET_URL`

**Backend (Railway/Render)**
1. Connect your repository
2. Set root directory: `server`
3. Set start command: `npm start`
4. Add environment variables from `.env.example`
5. Add MongoDB service or connect external MongoDB

---

## Post-Deployment

### ✅ Verification Steps

1. **Health Check**
   ```bash
   curl https://api.yourdomain.com/health
   ```

2. **Test API**
   ```bash
   curl https://api.yourdomain.com/api/machines
   ```

3. **Test Frontend**
   - Visit your domain
   - Login with admin credentials
   - Check Dashboard loads
   - Verify real-time data updates

4. **Test Email**
   - Submit feedback from Help page
   - Check email inbox for notification

### ✅ Monitoring

- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor server logs
- Set up uptime monitoring
- Monitor MongoDB performance
- Track API response times

### ✅ Maintenance

- Regular database backups
- Update dependencies regularly
- Monitor disk space (ML model storage)
- Review and rotate logs
- Update SSL certificates

---

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/sheild_iot
```

### Production
```env
NODE_ENV=production
CLIENT_ORIGIN=https://yourdomain.com
MONGO_URI=mongodb://user:pass@mongodb-host:27017/sheild_iot?authSource=admin
```

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `CLIENT_ORIGIN` matches your frontend domain exactly
   - Check protocol (http vs https)
   - Ensure no trailing slashes

2. **Database Connection Failed**
   - Verify MongoDB is running
   - Check connection string format
   - Verify network/firewall rules

3. **ML Predictions Not Working**
   - Ensure Python 3.10+ is installed
   - Install dependencies: `pip install -r server/requirements.txt`
   - Check server logs for Python errors

4. **Email Not Sending**
   - Verify EMAIL_USER and EMAIL_PASS are set
   - Check Gmail App Password is correct
   - Review server logs for email errors

5. **Socket.IO Connection Failed**
   - Verify VITE_SOCKET_URL matches backend URL
   - Check CORS configuration
   - Ensure WebSocket is not blocked by firewall

---

## Security Best Practices

1. **Never commit .env files** - Use .env.example as template
2. **Use strong JWT_SECRET** - Generate with crypto.randomBytes
3. **Enable MongoDB authentication** - Don't use default credentials
4. **Use HTTPS** - SSL/TLS certificates required
5. **Rate limiting** - Implement to prevent abuse
6. **Input validation** - Already implemented, but review regularly
7. **Regular updates** - Keep dependencies updated
8. **Backup strategy** - Regular MongoDB backups
9. **Monitor logs** - Watch for suspicious activity
10. **Change default passwords** - Update seed credentials

---

## Performance Optimization

1. **Enable MongoDB indexing** - Already configured on key fields
2. **Use CDN** - Serve static assets via CDN
3. **Enable compression** - Gzip/Brotli compression
4. **Database connection pooling** - Mongoose handles this
5. **Caching** - Consider Redis for frequently accessed data
6. **Load balancing** - For high traffic, use multiple server instances

---

## Support

For deployment issues:
1. Check server logs
2. Review error messages
3. Verify environment variables
4. Test endpoints individually
5. Check firewall/security group rules

---

## Quick Reference

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test MongoDB Connection
```bash
mongosh "mongodb://user:pass@host:27017/sheild_iot?authSource=admin"
```

### View Server Logs
```bash
# PM2
pm2 logs shield-backend

# Docker
docker-compose logs -f server

# Direct
# Check console output
```

### Restart Services
```bash
# PM2
pm2 restart shield-backend

# Docker
docker-compose restart

# Systemd
sudo systemctl restart shield-backend
```





