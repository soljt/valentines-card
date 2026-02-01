const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const app = express();
app.use(express.json());
app.set('trust proxy', 1);

['SECRET_KEY', 'HASHED_PASSWORD', 'SECRET_MESSAGE'].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

if (process.env.NODE_ENV === 'production') {
  app.disable('x-powered-by');
}

// Configuration
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY; // Change this!
const HASHED_PASSWORD = process.env.HASHED_PASSWORD
const MESSAGE = process.env.SECRET_MESSAGE

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attempts 💔 Please wait a minute and try again."
  }
});

// Inside backend/server.js
let hasAccepted = false; // Note: This resets if the container restarts. 

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get token from "Bearer <token>"

    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token" });
        req.user = decoded;
        next();
    });
};

app.get('/verify-token', verifyToken, (req, res) => {
    res.json({ valid: true, hasAccepted: hasAccepted });
});

app.post('/accept', verifyToken, (req, res) => {
    // In a production app, you'd check the JWT here
    hasAccepted = true; 
    res.json({ success: true });
});

app.post('/login', loginLimiter, async (req, res) => {
    const { password } = req.body;

    try {
        const match = await bcrypt.compare(password, HASHED_PASSWORD);
        
        if (match) {
            // Create a token that expires in 24 hours
            const token = jwt.sign({ user: 'valentine' }, SECRET_KEY, { expiresIn: '24h' });
            
            // For now, let's assume hasAccepted is false initially
            // In the next step, we'll make this persistent
            res.json({ 
                token, 
                hasAccepted: false, 
                message: "Access Granted" 
            });
        } else {
            res.status(401).json({ message: "That's not the secret code! 💔" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// 1. The Text Data
app.get('/card-content', verifyToken, (req, res) => {
    res.json({
        message: MESSAGE,
        svgId: "heart-pattern"
    });
});

let photoIndex = 0;
let photos = [];

// Helper to refresh the file list (runs on start)
const refreshPhotoList = () => {
    const assetsPath = path.join(__dirname, 'assets');
    photos = fs.readdirSync(assetsPath).filter(file => /\.(jpe?g|png)$/i.test(file));
    // Start at a random spot
    photoIndex = 5;
};
refreshPhotoList();
// 1. Get the current photo
app.get('/photo/current', verifyToken, (req, res) => {
    if (photos.length === 0) return res.status(404).send("No photos");
    res.sendFile(path.join(__dirname, 'assets', photos[photoIndex]));
});

// 2. Change the index (increment/decrement)
app.post('/photo/navigate', verifyToken, (req, res) => {
    const { direction } = req.body; // 'next' or 'prev'
    
    if (direction === 'next') {
        photoIndex = (photoIndex + 1) % photos.length;
    } else {
        photoIndex = (photoIndex - 1 + photos.length) % photos.length;
    }
    
    res.json({ success: true, total: photos.length, current: photoIndex });
});

// 3. Reset (also randomizes index for the next "First Look")
app.post('/reset', verifyToken, (req, res) => {
    hasAccepted = false;
    photoIndex = 5;
    res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => { // Adding '0.0.0.0' helps in Docker
    console.log(`Backend is listening on port ${PORT}`);
});