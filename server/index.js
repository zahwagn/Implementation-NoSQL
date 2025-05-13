require("dotenv").config();

const mediaRoutes = require('./routes/media.route');
const authRoutes = require('./routes/auth.route');
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const port = process.env.PORT;
const app = express();

// Connect to the database
db.connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        methods: "GET,POST,PUT,DELETE",
        credentials: true
    })
);

// Routes
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);

// Status endpoint
app.get('/status', (req, res) => {
    res.status(200).send({ status: "Server is running" });
});

app.listen(port, () => {
    console.log(`🚀 Server is running on PORT ${port}`);
});
