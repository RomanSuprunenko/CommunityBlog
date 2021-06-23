const mongoose = require('../mongoose');
const timestamps = require('mongoose-timestamp');
const s3 = require('../../services/s3');
const S3 = new s3();
const Mailer = require('../../services/mailer');
const fs = require('fs');
const nodeZip = require('node-zip');

const PAGE_SIZE = 3;

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    imgUrl: {
        type: String
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
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
    },
    status: {
        type: String,
        default: 'new'
    },
    category: {
        type: String
    }
});

schema.statics = {
    getByStoryboardId(userId) {
        return this.find({ createdBy: userId });
    },
    getAll(page = 1) {
        const skip = (page - 1) * PAGE_SIZE;
        return this.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(PAGE_SIZE);
    },
    like(id, userId) {
        return this.updateOne({ _id: id }, { $inc: { 'likes': 1 }, $push: { 'likedBy': userId } });
    },
    dislike(id, userId) {
        return this.updateOne({ _id: id }, { $inc: { 'dislikes': 1 }, $push: { 'dislikedBy': userId } });
    },
    async upload(fields, path, user) {

        if (!fields.title || !fields.duration || !fields.boards || !fields.width || !fields.height) {
            return "Doesn't have required fields";
        }

        if (!fields.private) { fields.private = null }
        if (!fields.description) { fields.description = null }

        let contents = fs.readFileSync(path);
        let zip = new nodeZip(contents, { base64: false, checkCRC32: true });
        let filenames = Object.keys(zip.files);
        console.log('filenames', filenames);

        const data = {
            createdBy: user._id, displayName: user.displayName, title: fields.title, description: fields.description, duration: fields.duration, boards: fields.boards, private: fields.private, width: fields.width, height: fields.height
        };
        const storyboard = await this.create({ ...data });
        console.log('storyboard', storyboard);

        if (storyboard) {
            for (var i = 0; i < filenames.length; i++) {
                if (zip.files[filenames[i]].dir == false) {
                    if (zip.files[filenames[i]].name.split('/')[zip.files[filenames[i]].name.split('/').length - 1].charAt(0) !== '.') {
                        if (zip.files[filenames[i]].name.indexOf('.storyboarder') > 0) {
                            zip.files[filenames[i]].name = 'main.storyboarder';
                        }
                        console.log(zip.files[filenames[i]].name);
                        let base64data = Buffer.from(zip.files[filenames[i]]['_data']);

                        const ContentType = zip.files[filenames[i]].name === 'main.storyboarder' ? `application/json` : `image/jpg`;
                        await S3.uploadFile('assets.storyboarders.com', storyboard._id + '/' + zip.files[filenames[i]].name, base64data, ContentType);
                    }
                }
            }
            Mailer.newStoryboard(storyboard._id, storyboard.title, user.email);
            return storyboard;
        }
    }
}

schema.plugin(timestamps);

module.exports = mongoose.model('storyboard', schema)
