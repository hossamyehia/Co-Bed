const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const coord = new Schema({
    latitude:{
        type: Number,
        default: 0 
    },
    longitude:{
        type: Number,
        default: 0
    }
});

const hospitalSchema = new Schema({
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
    admin:   {
        type: Boolean,
        default: false
    }
});

hospitalSchema.plugin(passportLocalMongoose);

var hospitals = mongoose.model('hospital', hospitalSchema);

module.exports = hospitals;