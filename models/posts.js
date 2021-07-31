const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    image: {
        type: String,
        default: ""
    }
},{
    timestamps: true
});

let posts = mongoose.model('post', postSchema);

module.exports = posts;