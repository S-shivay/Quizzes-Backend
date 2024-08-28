const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: { 
        type: String, 
        required: true 
    },
    options: [{
         type: String,
         required: true 
        }],
    correctAnswer: { 
        type: String 
    },
    timer: { 
        type: Number, 
        enum: [5, 10, 15], 
        required: true 
    }
});

const quizSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['Q&A', 'Poll'], 
        required: true 
    },
    questions: [questionSchema],
    impressions: { 
        type: Number, 
        default: 0 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Quiz', quizSchema);
