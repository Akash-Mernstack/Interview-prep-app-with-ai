import express from 'express'

import { togglePinQuestion, updateQuestionNote, addQuestionsToSession } from '../controllers/questioncontroller.js'




const router = express.Router()


router.post('/add', addQuestionsToSession)
router.post('/:id/pin', togglePinQuestion)
router.post('/:id/note', updateQuestionNote)


export default router