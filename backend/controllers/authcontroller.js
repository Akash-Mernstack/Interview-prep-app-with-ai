import User from '../Models/User.js'
import bcrypt from 'bcrypt'
import { configDotenv } from 'dotenv'
import jwt from 'jsonwebtoken'



configDotenv()
const JWTSecret = process.env.JWT_SECRET


//Generate jwt token//
const generatetoken = (Userid) => {
    return jwt.sign({ id: Userid }, JWTSecret, {
        expiresIn: "7d"
    })
}


//@desc Register a new user //
// @route Post/api/auth/register //
// @access PUblic//

const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl } = req.body

        //check if user already exist //
        const Userexist = await User.findOne({ email })
        if (Userexist) {
            return res.status(401).json({ message: "User already exist" })
        }

        //hash password//
        const salt = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(password, salt)
        const user = await User.create({
            name,
            email,
            password: hashedpassword,
            profileImageUrl,

        })
        // return user data with jwt//

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generatetoken(user._id)

        })
    } catch (error) {

        res.status(500).json({ message: "Server error", error: error.message })
    }

}

//@desc loginUser //
// @route Post/api/auth/login //
// @access PUblic//

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            console.log(user);
            return res.status(404).json({ message: "invalid email or password" })
        }
        //compare password
        const isMatched = await bcrypt.compare(password, user.password)
        if (!isMatched) {
            return res.status(404).json({ message: "bad credential" })
            console.log(isMatched);
        }
        //Return user data with jwt //

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,

            token: generatetoken(user._id)



        })


    }
    catch (error) {

        res.status(500).json({ message: "Server error", error: error.message })
    }

}


//@desc get user profile //
// @route get/api/auth/login //
// @access private//

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        res.status(200).json(user)
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

export default { registerUser, loginUser, getUserProfile }

