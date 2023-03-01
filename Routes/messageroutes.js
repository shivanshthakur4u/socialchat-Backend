const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Message = mongoose.model('Message');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


require('dotenv').config();

router.post('/savemessagetodb', async(req,res)=>{

    const {senderid, message, roomid, receiverid} = req.body;

    try{
        const newMessage = new Message({
            senderid,
            message,
            roomid,
            receiverid
        })
        await newMessage.save();
        res.send('Message saved successfilly')
    }
    catch(err){
        console.log('ERROR WHILE SAVING TO DB -',err)
        res.status(422).send(err.message)
    }
})

router.post('/getmessages',async (req,res)=>{
const {roomid} = req.body;

try{
 Message.find({roomid:roomid})
 .then(messages=>{
    res.send(messages);
 })
}
catch(err){
    console.log('ERROR WHILE GETTING DATA -',err);
    res.status(422).send(err.message)
}
})

router.post('/setusermessages',async(req,res)=>{
    const {ouruserid, fuserid, lastmessage, roomid} = req.body;

    // console.log('Message Received - ', req.body);
     User.findOne({_id:ouruserid})
     .then(async user=>{
        user.allmessages.map((item)=>{
            if(item.fuserid == fuserid)
            {
                user.allmessages.pull(item.fuserid)
            }
        })
        const date = Date.now()
        user.allmessages.push({
            ouruserid,
            fuserid,
            lastmessage,
            roomid,
            date
        })

        await  user.save()
        res.status(200).send({message:"Message saved successfully"});
     }).catch(err=>{
        console.log("error while updating all messages",err);
        res.send(422).send(err.message)
     })
})

router.post('/usermessages', async(req,res)=>{
    const {userid} = req.body;

    User.findOne({_id:userid}).then(user=>{
        res.status(200).send(user.allmessages);
    })
    .catch(err=>{
        console.log("error while getting all messages",err);
        res.send(422).send(err.message)
    })
})



module.exports = router