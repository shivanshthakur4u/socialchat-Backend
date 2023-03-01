const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique:true,
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
    },
    followers:{
        type:Array,
        default:[]
    },
    following:{
        type:Array,
        default:[]
    },
    descrption:{
        type:String,
        default:'',
    },
    allmessages:{
        type:Array,
        default:[]
    }


});

UserSchema.pre('save', async function (next){
    const user = this;
    // console.log('just before hashing', user.password);

    if(!user.isModified('password')){
        return next();
    }

   user.password = await bcrypt.hash(user.password, 8);
//    console.log('after hashing', user.password);

})

mongoose.model('User', UserSchema)