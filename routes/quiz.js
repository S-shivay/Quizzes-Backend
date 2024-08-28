const express = require('express');
const router = express.Router();
const quizSchema = require('../schema/quiz.schema');
const authMiddleware = require('../middleware/auth');

// Create a new quiz
router.post('', authMiddleware, async (req, res, next) => {
    try {
        const quizInfo = req.body;
        quizInfo.userId = req.user._id;
        const quiz = new quizSchema(quizInfo);
        await quiz.save();
        res.status(201).json(quiz);
    } catch (e) {
        next(e);
    }
});

// Share a quiz
router.post('/share/:id', authMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id;
        const quiz = await quizSchema.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const userId = req.user._id.toString();
        if (quiz.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to share this quiz' });
        }
        // Logic to generate shareable link
        const shareableLink = `${req.protocol}://${req.get('host')}/v1/quiz/take/${quiz._id}`;
        res.json({ message: 'Quiz shared successfully', link: shareableLink });
    } catch (e) {
        next(e);
    }
});

// Take a quiz (anonymous users)
router.get('/take/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const quiz = await quizSchema.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        quiz.impressions += 1;
        await quiz.save();
        res.json(quiz);
    } catch (e) {
        next(e);
    }
});

// Submit answers and calculate score (for Q&A quizzes)
router.post('/submit/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const quiz = await quizSchema.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const { answers } = req.body;
        if (quiz.type === 'Q&A') {
            // Calculate score
            let score = 0;
            quiz.questions.forEach((question, index) => {
                if (question.correctAnswer === answers[index]) {
                    score += 1;
                }
            });
            return res.json({ message: 'Quiz completed', score });
        } else {
            res.json({ message: 'Thank you for participating in the poll' });
        }
    } catch (e) {
        next(e);
    }
});

// Get analytics for a quiz
router.get('/analytics/:id', authMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id;
        const quiz = await quizSchema.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const userId = req.user._id.toString();
        if (quiz.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to view analytics' });
        }
        res.json({ impressions: quiz.impressions, responses: quiz.responses });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
