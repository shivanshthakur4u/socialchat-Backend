const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true
    },

    profilepic: {
        type: String,
        // required:true
        default: '',
    },
    posts: {
        type: Array,
        default: [],
    }


});

mongoose.model('User', UserSchema)