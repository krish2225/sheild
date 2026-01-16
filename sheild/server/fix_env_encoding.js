import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

const content = `MONGO_URI=mongodb+srv://utkarshsakpal2005_db_user:<HofELNqMGCY7Bvui>@cluster0.k2cscna.mongodb.net/?appName=Cluster0
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EMAIL_USER=utkarshsakpal2005@gmail.com
EMAIL_PASS=kmpqpaspdejpfqim
NODE_ENV=production
CLIENT_ORIGIN=http://localhost:5000`;

// Write with explicit UTF-8 encoding and no BOM
fs.writeFileSync(envPath, content, { encoding: 'utf8' });

console.log('Fixed .env file encoding successfully');
