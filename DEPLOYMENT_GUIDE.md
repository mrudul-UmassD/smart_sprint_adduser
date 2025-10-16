# Smart Sprint Deployment Guide

This guide covers various deployment options for the Smart Sprint application, from development to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Development](#local-development)
4. [Production Deployment](#production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Database Setup](#database-setup)
8. [SSL Configuration](#ssl-configuration)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **MongoDB**: v6.0 or higher
- **Git**: Latest version
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)

### Hardware Requirements

#### Minimum (Development)
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 10GB free space
- **Network**: Broadband internet connection

#### Recommended (Production)
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Network**: High-speed internet with low latency

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smart-sprint
DB_NAME=smart-sprint

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Smart Sprint <noreply@smartsprint.com>

# Redis Configuration (Optional - for caching)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:5000

# Application Configuration
REACT_APP_NAME=Smart Sprint
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_DARK_MODE=true

# External Services
REACT_APP_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
REACT_APP_SENTRY_DSN=your-sentry-dsn

# Build Configuration
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
```

## Local Development

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/smart-sprint.git
cd smart-sprint
```

2. **Install dependencies:**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. **Set up environment variables:**
```bash
# Copy example environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the files with your configuration
```

4. **Start MongoDB:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

5. **Run the application:**
```bash
# From the root directory
npm run dev
```

This starts both frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

### Development Scripts

```bash
# Start both frontend and backend
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Run tests
npm run test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Production Deployment

### Manual Deployment

#### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

#### 2. Application Setup

```bash
# Clone repository
git clone https://github.com/yourusername/smart-sprint.git
cd smart-sprint

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install && cd ..

# Build frontend
cd frontend && npm run build && cd ..

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Create uploads directory
mkdir -p backend/uploads
chmod 755 backend/uploads
```

#### 3. Database Setup

```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database user (optional but recommended)
mongo
> use smart-sprint
> db.createUser({
    user: "smartsprint",
    pwd: "secure-password",
    roles: ["readWrite"]
  })
> exit
```

#### 4. Process Management with PM2

Create `ecosystem.config.js` in the root directory:

```javascript
module.exports = {
  apps: [{
    name: 'smart-sprint-backend',
    script: './backend/server.js',
    cwd: './backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start the application:

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

#### 5. Nginx Configuration

Create `/etc/nginx/sites-available/smart-sprint`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve static files
    location / {
        root /path/to/smart-sprint/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads {
        alias /path/to/smart-sprint/backend/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/smart-sprint /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: smart-sprint-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: smart-sprint
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    ports:
      - "27017:27017"
    networks:
      - smart-sprint-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: smart-sprint-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/smart-sprint?authSource=admin
      JWT_SECRET: your-jwt-secret
      PORT: 5000
    volumes:
      - ./backend/uploads:/app/uploads
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - smart-sprint-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: http://localhost:5000/api
    container_name: smart-sprint-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - smart-sprint-network

  nginx:
    image: nginx:alpine
    container_name: smart-sprint-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - smart-sprint-network

volumes:
  mongodb_data:

networks:
  smart-sprint-network:
    driver: bridge
```

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## Cloud Deployment

### AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize EB application:**
```bash
eb init smart-sprint --region us-east-1
```

3. **Create environment:**
```bash
eb create production
```

4. **Deploy:**
```bash
eb deploy
```

#### Using AWS ECS

Create `docker-compose.aws.yml` for ECS deployment:

```yaml
version: '3.8'

services:
  backend:
    image: your-account.dkr.ecr.region.amazonaws.com/smart-sprint-backend:latest
    environment:
      MONGODB_URI: mongodb://your-mongodb-cluster
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "5000:5000"
    
  frontend:
    image: your-account.dkr.ecr.region.amazonaws.com/smart-sprint-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Heroku Deployment

1. **Install Heroku CLI**
2. **Create Heroku apps:**
```bash
heroku create smart-sprint-backend
heroku create smart-sprint-frontend
```

3. **Set environment variables:**
```bash
heroku config:set NODE_ENV=production --app smart-sprint-backend
heroku config:set JWT_SECRET=your-secret --app smart-sprint-backend
heroku config:set MONGODB_URI=your-mongodb-uri --app smart-sprint-backend
```

4. **Deploy:**
```bash
git subtree push --prefix backend heroku-backend main
git subtree push --prefix frontend heroku-frontend main
```

### DigitalOcean App Platform

Create `.do/app.yaml`:

```yaml
name: smart-sprint
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/smart-sprint
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${MONGODB_URI}
  - key: JWT_SECRET
    value: ${JWT_SECRET}

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/smart-sprint
    branch: main
  build_command: npm run build
  run_command: npx serve -s build -l 3000
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: smart-sprint-db
  engine: MONGODB
  version: "6"
```

## Database Setup

### MongoDB Atlas (Cloud)

1. **Create cluster** at https://cloud.mongodb.com
2. **Create database user**
3. **Whitelist IP addresses**
4. **Get connection string:**
```
mongodb+srv://username:password@cluster.mongodb.net/smart-sprint?retryWrites=true&w=majority
```

### Local MongoDB

```bash
# Install MongoDB
# Ubuntu
sudo apt-get install mongodb-org

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod

# Connect to MongoDB
mongo

# Create database and user
use smart-sprint
db.createUser({
  user: "smartsprint",
  pwd: "password",
  roles: ["readWrite"]
})
```

### Database Migration

Create `backend/scripts/migrate.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Run migrations here
    console.log('Migration completed successfully');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
```

Run migration:
```bash
node backend/scripts/migrate.js
```

## SSL Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Setup

Update Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Your existing configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Logging

### Application Monitoring

Install monitoring tools:

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Health Checks

Add health check endpoint in `backend/routes/health.js`:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbState === 1 ? 'Connected' : 'Disconnected',
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    };
    
    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

module.exports = router;
```

### Log Management

Configure Winston for logging:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/smart-sprint
chmod -R 755 /path/to/smart-sprint
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Clear npm cache
npm cache clean --force
```

### Performance Optimization

#### Backend Optimization
- Enable gzip compression
- Implement caching with Redis
- Use database indexing
- Optimize database queries
- Enable connection pooling

#### Frontend Optimization
- Enable code splitting
- Implement lazy loading
- Optimize images
- Use CDN for static assets
- Enable service workers

### Backup and Recovery

#### Database Backup
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/smart-sprint" --out=/backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/smart-sprint" /backup/20250115/smart-sprint
```

#### Automated Backup Script
```bash
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure environment variables
- [ ] Enable rate limiting
- [ ] Implement input validation
- [ ] Use secure headers
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Implement proper authentication
- [ ] Use secure session management
- [ ] Enable CORS properly

This deployment guide should help you successfully deploy Smart Sprint in various environments. For specific issues, consult the troubleshooting section or create an issue in the project repository.