const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const organizationSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    coordinates:{
        latitude:{
            type: Number,
            default: 0 
        },
        longitude:{
            type: Number,
            default: 0
        }
    },
    totalBeds:{
        type: Number,
        min: 0,
        default: 1
    },
    coronaBeds:{
        type: Number,
        min: 0,
        default: 1
    },
    totalAvailableBeds:{
        type: Number,
        min: 0,
        default: 1
    },
    coronaAvailableBeds:{
        type: Number,
        min: 0,
        default: 1
    },
    image: {
        type: String,
        default: ""
    },
    accepted:   {
        type: Boolean,
        default: false
    }
});

organizationSchema.plugin(passportLocalMongoose);

var organizations = mongoose.model('organizations', organizationSchema);

module.exports = organizations;