const express = require("express")
const app = express()
const cors = require("cors")
app.use(express.json())
const userRoutes = require('./routes/user.routes')
const PORT = 5050
require("dotenv").config()
const databaseConnect = require("../backend/utils/connectDatabase")



app.use('/api/user' , userRoutes)




databaseConnect().then(() => {
 app.listen(PORT , () => {
   console.log(`App is listening on PORT ${PORT}`)
 })
}).catch(() => {
 console.log("Error connecting to the database bitch")
})


