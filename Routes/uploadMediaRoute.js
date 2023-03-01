const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


require('dotenv').config();

const nodemailer = require('nodemailer');


router.post('/userprofilepic', (req, res) => {
    const { email, profilepic } = req.body;

    User.findOne({ email: email }).then(async savedUser => {
        if (!savedUser) {
            return res.status(422).json({ error: "Invalid Credentials" });
        } else {
            savedUser.profilepic = profilepic
            savedUser.save().then(user => {
                return res.status(200).json({ message: "Profile picture updated successfully" });
            }).catch(err => {
                res.status(422).json({ error: "Internal Server Error" })
            })
        }
    })

})


router.post('/userPost',(req,res)=>{
    const {email, post, postdescription} = req.body;
     
    User.findOne({email:email}).then(async savedUser=>{
        if(!savedUser){
            return res.status(422).json({error:"Invalid Credentials"});
        }
        else{
            if(savedUser){
                savedUser.posts.push({post, postdescription, likes:[], comments:[]});
                savedUser.save().then(user=>{
                    return res.status(200).json({message:"Post added successfully"});
                }).catch(err=>{
                    res.json({error:'Error occured while adding post'})
                })
                
            }
        }
    })
})

router.post('/showfollowingpost',(req,res)=>{
const {myemail} =req.body;

        if(!myemail){
            return res.status(422).json({error:"Invalid Credentials"})
        }
        else{
            User.findOne({email:myemail})
            .then(async savedUser=>{
                if(!savedUser){
                    return res.status(422).json({error:"Invalid Credentials"})
                }
                else{
                    let followingdata =[];
                    // console.log(savedUser.following)
                        savedUser.following.map(item=>{
                            
                           
                            followingdata.push(item)
                            
                            // for(i=0;i<=item.length; i++){
                            // //   res.status(200).json({message:'following users',{user:item[i]} })
                            // console.log(item[i]);
                            // }
                        })
                       if(followingdata.length >0){
                        followingdata.map(item=>{
                            User.findOne({email:item})
                            .then(async savedUser=>{
                                

                              if(savedUser.posts.length > 0 ){
                                let Data =
                                    {
                                        _id:savedUser._id,
                                         username:savedUser.username,
                                         email:savedUser.email,
                                         description:savedUser.descrption,
                                         profilepic:savedUser.profilepic,
                                         following:savedUser.following,
                                         followers:savedUser.followers,
                                         posts:savedUser.posts,
                                         postlikes:savedUser.posts.likes,
                                         postcomments:savedUser.posts.comments
                                        }
                                
                                
                                    
                                
                                   return res.status(200).json({message:"user post data",user: Data})
                              }
                                
                            })
                            
                        })
                        
                       }
                       else{

                        return res.status(422).json({error:"You are not following anyone"})
                       }
                }
            })
        }
})



module.exports = router