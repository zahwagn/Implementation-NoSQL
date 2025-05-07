require("dotenv").config()

const express = require("express") // Importing express package 
const cors = require("cors") // Importing cors package
const { dbConnect } = require("./config/dbConnect") //  dbConnect() - Database Connection

// Importing Routes
const todoRoutes = require("./routes/TodoRoutes")
const userRoutes = require("./routes/UserRoutes")

const app = express()
const PORT = process.env.PORT || 5000

/**
 * Middlewares
 *      - express.json() - To handle (parse) the json data coming in request 
 *      - express.urlencoded({extended: true}) - To handle data coming from URL in encoded format
 *      - cors - To handle cross origin requests
 */
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

// testing 
app.get("/", (req, res)=>{
    res.status(200).json({
        success: true,
        message: "Homepage"
    })
})

// redirect /user to userRoutes and /todo to todoRoutes
app.use("/todo", todoRoutes)
app.use("/user", userRoutes)

dbConnect() // connect database

// Run server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on PORT ${PORT}`)
})