const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MessageSchema = new mongoose.Schema({
    senderid:{
        type:String,
        required:true
    },
    message:{
   type:String,
   required:true
    },
    roomid:{
    type:String,
    required:true
    },
    receiverid:{
        type:String,
        required:true
    },


},{
    timestamps:true
});


mongoose.model('Message', MessageSchema)