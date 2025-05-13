require("dotenv").config();

const mediaRoutes = require('./routes/media.route');
const authRoutes = require('./routes/auth.route');
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const port = process.env.PORT;
const app = express();

// connect to database
db.connectDB();

app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        methods: "GET,POST,PUT,DELETE",
        credentials: true
    })
);

// status
app.get('/status', (req, res) => {
    res.status(200).send({ status: "Server is running" });
})

// media routes
app.use("/media", mediaRoutes);

app.listen(port, () => {
    console.log(`🚀 Server is running on PORT ${port}`);
});

