const mongoose = require('../mongoose');
const timestamps = require('mongoose-timestamp');

const schema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    storyboardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'storyboard',
        required: true
    },
    likes: {
        type: Number
    },
    dislikes: {
        type: Number
    },
    likedBy: {
        type: Array
    },
    dislikedBy: {
        type: Array
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    displayName: {
        type: String
    },
    editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

schema.statics = {
    getAll() {
        return this.find().sort({ createdAt: -1 });
    },
    like(id, userId) {
        return this.updateOne({ _id: id }, { $inc: { 'likes': 1 }, $push: { 'likedBy': userId }});
    },
    dislike(id, userId) {
        return this.updateOne({ _id: id }, { $inc: { 'dislikes': 1 }, $push: { 'dislikedBy': userId }});
    }
}

schema.plugin(timestamps);

module.exports = mongoose.model('comment', schema)
