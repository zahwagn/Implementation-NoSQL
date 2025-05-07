// Importing mongoose package
const mongoose = require("mongoose")
const { MONGODB_URL } = process.env

// dbConnect - Database connection
exports.dbConnect = () => {
    mongoose.connect(MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then((conn)=>{
        console.log("Database connected successfully...") // successfull connection logs the success message and hostname
        console.log(`Host name ${conn.connection.host}`);
    })
    .catch((error)=>{
        console.log("Database connection failed!")
        console.log(`DB connection Error: ${error}`) // connection failure logs the failure message, error object and exits the process
        process.exit(1)
    })
}