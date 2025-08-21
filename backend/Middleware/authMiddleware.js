import Jwt from "jsonwebtoken";
import User from "../Models/User.js";
import { configDotenv } from "dotenv";
configDotenv()
const Jwt_secret = process.env.JWT_SECRET

//Middleware to protect routes//
const protect = async (req, res, next) => {
    try {

        let token = req.headers.authorization
        if (token && token.startsWith("Bearer")) {
            token = token.split(' ')[1]
            let decoded = Jwt.verify(token, Jwt_secret)
            req.user = await User.findById(decoded.id).select('-password')
            next()
        } else {
            res.status(401).json({ message: "Not authorized,no token", sucess: false })
        }
    } catch (err) {
        res.status(404).json({ message: "token failed", err: err.message })
    }
}

export default protect