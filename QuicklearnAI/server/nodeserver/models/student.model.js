const mongoose = require('mongoose');

const studentschema = new mongoose.Schema({
    avatar: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    phone: {
        type: Number,
        required: false,
        default: null
    },
}, { timestamps: true });
const student = mongoose.model('student', studentschema);


module.exports = student;