import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './Routers/authRoutes.js'
import ConnectDb from './config/db.js'
import sessionRoutes from './Routers/sessionRoutes.js'
import questionRoutes from './Routers/questionRoutes.js'
import protect from './Middleware/authMiddleware.js'
import { generateInterviewQuestion, generateConceptExplanation } from './controllers/aicontroller.js'

dotenv.config()
const app = express()

// CORS
app.use(cors({
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

// DB Connect
ConnectDb()

// Middleware
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/questions', questionRoutes)

app.use('/api/ai/generate-questions', protect, generateInterviewQuestion)
app.use('/api/ai/generate-explanation', protect, generateConceptExplanation)

// 🚀 Export app instead of listen
export default app
