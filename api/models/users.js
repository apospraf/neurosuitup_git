const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    username: {type: String, required: true},
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/},
    hash: {type: String, required: true},
    viewed: {type: Boolean, default: false},
    age: {type: Number, required: false},
    gender: {type: String, default: "N/A"},
    history: {type: String, default: ""},
    role: {type: String, default: "default"},
    prescription: [{type: mongoose.Schema.Types.ObjectId}],
    patients: [{type: mongoose.Schema.Types.ObjectId}],
    poses: [{type: mongoose.Schema.Types.ObjectId}],
    tasks: [{type: mongoose.Schema.Types.ObjectId}],
    exercises: [{type: mongoose.Schema.Types.ObjectId}],
    levels: [{type: mongoose.Schema.Types.ObjectId}],
    analytics: {
        belt: {type: Number, default: 1},
        highscore: {type: Number, default: 0},
    }
});

module.exports = mongoose.model('User', userSchema);