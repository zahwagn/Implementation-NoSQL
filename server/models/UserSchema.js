/**
 * Importing mongoose
 */
 const mongoose = require("mongoose")

 /**
  * Destructuring from mongoose
  *      - Schema Constructor
  *      - model method
  */
 const { Schema, model } = mongoose
 
 /**
  * UserSchema - Creating a schema for Todo
  *     -  role: Nilai berupa string, secara default berisi nilai 'user'.
  *      - name: Nilai berupa string, merupakan field yang wajib diisi, maksimal 50 karakter.
  *      - email: Nilai berupa string, merupakan field yang wajib diisi, harus unik
  *      - profession: Nilai berupa string.
  *      - appwriteId: Nilai berupa string, merupakan field yang wajib diisi.
  *      - todos: Merupakan koleksi (array) dari ObjectId yang merujuk ke todo.
  */
 const UserSchema = new Schema({
    role: {
        type: String,
        default: "user"
    },
     name:{
         type: String,
         required: [true, "Title of todo is required"],
         maxLength: [50, "Maximum length of name is 50 charecters"],
         trim: true
     },
     email:{
        type: String,
        required: [true, "Title of todo is required"],
        unique: true
    },
     profession:{
        type: String,
    },
    appwriteId: {
        type: String,
        required: [true, "Title of todo is required"],
    },
     todos:{
         type: [{
             type: Schema.Types.ObjectId,
             ref: "todo",
             required: [true, "Todo Id is required to store todo for user"]
         }],
     }
 }, {
    timestamps: true
 })
 
 /**
  * Exporting model
  *      - Creating a model from the Schema defined and export
  */
 module.exports = model("user", UserSchema)