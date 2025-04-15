const express = require('express');
const path = require('path');

require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware to serve static files (CSS, JS, images)
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images'))); // Static image section

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route for Game Room Page
app.get('/game', (req, res) => {
    const roomId = req.query.roomid; // Extract room ID from query parameters
    const userId = req.query.userid; // Extract user ID from query parameters
    res.render('game', {
        HOSTIP: process.env.HOSTIP,      // Extracted from .env
        HOSTPORT: process.env.HOSTPORT, // Extracted from .env
        roomId: roomId,                 // Passed from the query parameters
        userId: userId,                 // Passed from the query parameters
    });
});

// Route for Homepage
app.get('/', (req, res) => {
    res.render('index', {
        user: null, // Optional user information
        BACKEND_URL: `http://${process.env.HOSTIP}:${process.env.HOSTPORT}`, // Dynamic backend URL
        projectName: process.env.REACT_APP_PROJECT_NAME || 'Default Project', // Dynamic project name
    });
});

// Start the Server
const PORT = process.env.PORT || 3001;
const HOSTIP = process.env.HOSTIP || 'localhost';
const HOSTPORT = process.env.HOSTPORT || 3000;

app.listen(PORT, () => {
    console.log(`✨ Server running at http://${HOSTIP}:${PORT}`);
});