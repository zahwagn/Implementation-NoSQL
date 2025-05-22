require("dotenv").config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const mediaRoutes = require('./routes/media.route');
const authRoutes = require('./routes/auth.route');

const app = express();
const port = process.env.PORT || 3000;

// Connect to database
db.connectDB();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});