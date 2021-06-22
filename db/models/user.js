const mongoose = require('../mongoose');
const timestamps = require('mongoose-timestamp');
const sharp = require('sharp');
const s3 = require('../../services/s3');
const S3 = new s3();
const config = require('config');
const { forgotPassword } = require('../../services/email_content');
const bucket = config.get('aws.imageBucket');
const USER_ROLE = 'user';

const schema = new mongoose.Schema({
    username: {
        type: String
    },
    displayName: {
        type: String
    },
    role: {
        type: String,
        default: USER_ROLE
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    emailConfirmed: {
        type: Boolean,
        default: false
    },
    passwordHash: {
        type: String
    },
    forgotPasswordHash: {
        type: String
    },
    emailConfirmationHash: {
        type: String
    },
    hasAvatar:{
        type: Boolean,
        default: false
    },
    imageUrl: {
        type: String
    },
    thumbnailUrl: {
        type: String
    },
    location: {
        type: String
    },
    website: {
        type: String
    },
    twitter: {
        type: String
    },
    about: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    }
});

schema.statics = {
    getByName(name) {
        return this.findOne({ name }, { passwordHash: 0, confirmHash: 0 });
    },
    getAll() {
        return this.find({ active: true }, { passwordHash: 0, confirmHash: 0 }).sort({ createdAt: -1 });
    },
    // edit(id, data) {
    //     return this.updateOne({ _id: id }, data);
    // },
    // delete(id) {
    //     return this.remove({ _id: id });
    // },
    async updateProfileImage(path, id) {
        console.log('here');
        const profileImageBuffer = this._resizeImage(path, 512, 512);
        console.log('profileImageBuffer', profileImageBuffer);

        const profileResult = await S3.uploadFile(bucket, 'user/' + id + '/profile.jpg', profileImageBuffer, `image/png`);
        console.log('profileResult', profileResult);

        const thumbnailImageBuffer = this._resizeImage(path, 128, 128);
        const thumbnailResult = await S3.uploadFile(bucket, 'user/' + id + '/thumbnail.jpg', thumbnailImageBuffer, `image/png`);
        return this.updateOne({ _id: id }, { hasAvatar: true, imageUrl: profileResult.Location, thumbnailUrl: thumbnailResult.Location });
    },
    _resizeImage(path, x, y) {
        return sharp(path)
            .resize(x, y)
            .crop(sharp.strategy.entropy)
            .jpeg({ quality: 40 })
            .toBuffer();

    }
}

schema.plugin(timestamps);
module.exports = mongoose.model('user', schema);
