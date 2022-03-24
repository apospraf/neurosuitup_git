const mongoose = require("mongoose");

const exerciseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    codename: {type: String, ref: "Codename", required: true},
    isPublic: {type: Boolean, required: true},
    tasks: [{type: mongoose.Schema.Types.ObjectId, required: true}],
    delays: [{type: Number, required: true}]
});

module.exports = mongoose.model('Exercise', exerciseSchema);