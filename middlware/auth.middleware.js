const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()


const auth = async (req , res, next) => {
  try {
    const token = req.cookies.accessToken
    if(!token) {
      return res.status(400).send("Please provide token")
    }

    const decode = await jwt.verify(token , process.env.ACCESS_TOKEN_KEY);
    console.log(decode)

    if(!decode) {
      return res.status(400).json({ message : "unauthorized access"})
    }

    req.id = decode.userId; 
    req.role = 'user'
    next()

  }
  catch(error) {
    res.status(401).json({message : "unauthorized access" , error : error})
  }
}


module.exports = {
  auth
}
