const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String }, // Only for Q&A type
    timer: { type: String, enum: ["off", "5", "10", "15"], required: true },
    type: { type: String, enum: ['text', 'imageURL', 'textImage'], required: true }
});

const responseSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: String },
    isCorrect: { type: Boolean } // Only for Q&A type
});

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['Q&A', 'Poll'], required: true },
    questions: [questionSchema],
    impressions: { type: Number, default: 0 },
    responses: [responseSchema], // Store responses for analytics
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
