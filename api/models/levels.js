const mongoose = require("mongoose");

const levelSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    codename: {type: String, required: true},
    belt: {type: String, default: "white"},
    isPublic: {type: Boolean, required: true},
    exercises: [{type: mongoose.Schema.Types.ObjectId, required: true}],
    delays: [{type: Number, required: true}]
});

module.exports = mongoose.model('Level', levelSchema);