import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './Routers/authRoutes.js'
import ConnectDb from './config/db.js'
import path from "path";
import { fileURLToPath } from 'url';
import sessionRoutes from './Routers/sessionRoutes.js'
import questionRoutes from './Routers/questionRoutes.js'
import protect from './Middleware/authMiddleware.js'
import { generateInterviewQuestion, generateConceptExplanation } from './controllers/aicontroller.js'



// Load environment variables
dotenv.config()
const app = express()

// Middleware to handle CORS
app.use(cors({
    origin: '*',
    methods: ["GET", 'POST', "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

// Connect DB
ConnectDb()

// Middleware
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/questions', questionRoutes)


app.use('/api/ai/generate-questions', protect, generateInterviewQuestion)
app.use('/api/ai/generate-explanation', protect, generateConceptExplanation)

// Serve Uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))



// Start server
const Port = process.env.PORT || 8000

app.listen(Port, () => {
    console.log(`Server is listening on port ${Port}`);
})
