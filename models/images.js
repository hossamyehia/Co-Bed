const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    fieldname: {
        type: String,
        required: true
    },
    originalname: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    Path: {
        type: String,
        required: true
    },
    idOnDrive: {
        type: String,
        required: true
    },
    parentId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    postsFolderId:{
        type: String,
        default: ""
    },
    postImage: {
        type: Boolean,
        default:false
    },
    postId: {
        type: String,
        default: ""
    }
});

let images = mongoose.model('image', imageSchema);

module.exports = images;