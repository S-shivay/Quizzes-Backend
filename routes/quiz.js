const express = require('express');
const router = express.Router();
const quizSchema = require('../schema/quiz.schema');
const authMiddleware = require('../middleware/auth');

// Create a new quiz
router.post('/create', authMiddleware, async (req, res, next) => {
    try {
        const quizInfo = req.body;
        quizInfo.userId = req.user._id; // Associate quiz with user
        const quiz = new quizSchema(quizInfo);
        await quiz.save();
        res.status(201).json(quiz);
    } catch (e) {
        next(e);
    }
});

// Share a quiz
router.post('/share', authMiddleware, async (req, res, next) => {
    try {
        const { quizId } = req.body;
        const quiz = await quizSchema.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const userId = req.user._id.toString();
        if (quiz.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to share this quiz' });
        }
        const shareableLink = `${req.protocol}://${req.get('host')}/v1/quiz/take/${quiz._id}`;
        res.json({ message: 'Quiz shared successfully', link: shareableLink });
    } catch (e) {
        next(e);
    }
});

// List quizzes and provide summary stats
router.get('/list', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user._id;
      const quizzes = await quizSchema.find({ userId });
  
      // Calculate the statistics
      const quizzesCreated = quizzes.length;
      const questionsCreated = quizzes.reduce((total, quiz) => total + quiz.questions.length, 0);
      const totalImpressions = quizzes.reduce((total, quiz) => total + (quiz.impressions || 0), 0);
  
      // Example trending quizzes (for simplicity, just sending back all quizzes)
      const trendingQuizzes = quizzes.map((quiz) => ({
        name: quiz.title,
        date: quiz.createdAt,
        impressions: quiz.impressions || 0,
      }));
  
  
      // Send back the data in the expected format
      res.status(200).json({
        quizzesCreated,
        questionsCreated,
        totalImpressions,
        trendingQuizzes,
      });
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
            const responses = [];
            quiz.questions.forEach((question, index) => {
                const isCorrect = question.correctAnswer === answers[index];
                responses.push({
                    questionId: question._id,
                    selectedOption: answers[index],
                    isCorrect
                });
                if (isCorrect) score += 1;
            });
            quiz.responses.push(...responses); // Store responses
            await quiz.save();
            res.json({ message: 'Quiz completed', score });
        } else {
            // For Poll type quizzes
            quiz.responses.push({ answers });
            await quiz.save();
            res.json({ message: 'Thank you for participating in the poll' });
        }
    } catch (e) {
        next(e);
    }
});

// Delete a quiz
router.delete('/delete/:id', authMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id;
        const quiz = await quizSchema.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const quizCreator = quiz.userId.toString();
        const user = req.user._id.toString();
        if (quizCreator !== user) { // Check if the user is the creator of the quiz
            return res.status(403).json({ message: 'You are not authorized to delete this quiz' });
        }
        await quizSchema.findByIdAndDelete(id);
        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (e) {
        next(e);
    }
});

// Get analytics for a quiz
router.get('/analytics/:id', authMiddleware, async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'Quiz ID is required' });
        }
        console.log("Received Quiz ID:", id); 
        
        const quiz = await quizSchema.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const userId = req.user._id.toString();
        if (quiz.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to view analytics' });
        }
        const correctResponses = quiz.responses.filter(response => response.isCorrect).length;
        res.json({ 
            impressions: quiz.impressions, 
            responses: quiz.responses.length, 
            correctResponses 
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
