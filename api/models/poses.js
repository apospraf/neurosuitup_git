const mongoose = require("mongoose");

const poseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    codename: {type: String, ref: "Codename", required: true},
    isPublic: {type: Boolean, required: true},
    angles: {
        SyL: {type: String, required: true, default: 0},
        SzL: {type: String, required: true, default: 0},
        UxL: {type: String, required: true, default: 0},
        UyL: {type: String, required: true, default: 0},
        UzL: {type: String, required: true, default: 0},
        FyL: {type: String, required: true, default: 0},
        FzL: {type: String, required: true, default: 0},
        // HxL: {type: String, required: true, default: 0},
        // HzL: {type: String, required: true, default: 0},
        SyR: {type: String, required: true, default: 0},
        SzR: {type: String, required: true, default: 0},
        UxR: {type: String, required: true, default: 0},
        UyR: {type: String, required: true, default: 0},
        UzR: {type: String, required: true, default: 0},
        FyR: {type: String, required: true, default: 0},
        FzR: {type: String, required: true, default: 0},
        // HxR: {type: String, required: true, default: 0},
        // HzR: {type: String, required: true, default: 0}   
    }
});

module.exports = mongoose.model('Pose', poseSchema);