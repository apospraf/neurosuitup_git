const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    codename: {type: String, ref: "Codename", required: true},
    isPublic: {type: Boolean, required: true},
    poses: [{type: mongoose.Schema.Types.ObjectId, required: true}],
    difficulty: {type: Number, default: 1}
});

module.exports = mongoose.model('Task', taskSchema);