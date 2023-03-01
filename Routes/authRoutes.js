const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const nodemailer = require('nodemailer');


async function mailer(receiverEmail, code) {
    // console.log('mailer function called');

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,

        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.Nodemailer_Email,
            pass: process.env.Nodemailer_Password,
        },
    });


    let info = await transporter.sendMail({
        from: "Social Chat",
        to: `${receiverEmail}`,
        subject: 'Email Verification',
        text: `Your Verification Code is ${code}`,
        html: `<b>Your Verification Code is ${code}</b>`
    })

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

router.post('/verify', (req, res) => {
    // console.log(req.body);
    const { email } = req.body;

    if (!email) {
        return res.status(422).json({ error: 'Fill all the fields' });
    } else {
        User.findOne({ email: email })
            .then(async(savedUser) => {
                // console.log(savedUser);
                // return res.status(200).json({ message: 'Message Sent' });
                if (savedUser) {
                    return res.status(422).json({ error: 'User Already Exist' });
                }
                try {
                    let verificationCode = Math.floor(100000 + Math.random() * 900000);
                    await mailer(email, verificationCode);
                    return res.status(200).json({ message: 'Message Sent', verificationCode, email });
                } catch (err) {
                    return res.status(422).json({ error: 'Error while sending email' });
                }
            })
            // return res.status(200).json({ message: 'Message Sent' });
    }

})

router.post('/changeusername', (req, res) => {
    const { username, email } = req.body;

    User.find({ username }).then(async(savedUser) => {
        if (savedUser.length > 0) {
            return res.status(422).json({ error: "Username already Exist" });
        } else {
            return res.status(200).json({ message: "Username Available", username, email });
        }
    })
})

router.post('/signup', async(req, res) => {
        const { email, username, password } = req.body;
        if (!email || !password || !username) {
            return res.status(422).json({ error: "All fields are required" });
        } else {
            const user = new User({
                username,
                email,
                password,
            })
            try {
                await user.save();
                const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
                res.status(200).json({ message: "User registered successfully", token })
            } catch (err) {
                return res.status(422).json({ error: "Error occured in Registration", err });
            }
        }



    }

)

router.post('/forgotpassword', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(422).json({ error: "Enter the Registered Email Please" })
    } else {
        User.findOne({ email: email }).then(async(savedUser) => {
            if (savedUser) {

                try {
                    let verificationCode = Math.floor(100000 + Math.random() * 900000)
                    await mailer(email, verificationCode);
                    res.send({ message: 'Message Sent', verificationCode, email });

                } catch (err) {
                    return res.status(422).json({ error: 'Error while sending Code' });
                }

            } else {
                return res.status(422).json({ error: "Email is not Registered" })


            }

        })
    }
})

router.post('/fchangepassword', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "All fields are required" })
    } else {
        User.findOne({ email: email }).then(async(savedUser) => {
            if (savedUser) {
                savedUser.password = password;
                savedUser.save().then(user => { return res.status(200).json({ message: "Password Changed Successfully" }) })
                    .catch(err => { console.log(err) });

            } else {
                return res.status(422).json({ Error: "Error in changing Password" })
            }
        })
    }
})


router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "All fields are Required" })
    } else {
        User.findOne({ email: email }).then(async(savedUser) => {
            if (!savedUser) {
                return res.status(422).json({ error: "Invalid credentials" });
            } else {
                try {

                    //    if( savedUser.email == email && savedUser.password == password){

                    //    }

                    bcrypt.compare(password, savedUser.password)
                        .then(
                            doMatch => {
                                if (doMatch) {
                                    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
                                    const { _id, username, email } = savedUser;

                                    res.status(200).json({ message: "Signed in successfully", token, user: { _id, username, email } })
                                }
                            }
                        )




                } catch (err) {
                    res.status(422).json({ error: "Error occured while signing" });

                }
            }
        }).catch(err => {
            console.log(err)
        })
    }
})



router.post('/userProfile', (req, res) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(422).json({ error: "You must be logged in, token not given" })
    }

    const token = authorization.replace("Bearer ", "");
    // console.log(token);

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(422).json({ error: "You must be logged in, token not correct" })
        }

        const { _id } = payload;
        User.findById(_id).then(userdata => {
            let data ={
                _id:userdata._id,
                username:userdata.username,
                email:userdata.email,
                descrption:userdata.descrption,
                profilepic:userdata.profilepic,
                following:userdata.following,
                followers:userdata.followers,
                posts:userdata.posts,
            }
            res.status(200).json({ message: "User Found", user: data })
        })
    })

})

router.post('/changePassword', (req, res) => {
    const { email, oldpassword, newpassword } = req.body;
    if (!email || !oldpassword || !newpassword) {
        return res.status(422).json({ error: 'All fields are required' })
    }
    User.findOne({ email: email }).then(async(savedUser) => {
        if (!savedUser) {
            return res.status(422).json({ error: "Something went Wrong" });
        } else {
            if (savedUser) {
                bcrypt.compare(oldpassword, savedUser.password).then(
                    domatch => {
                        if (domatch) {
                            savedUser.password = newpassword;
                            savedUser.save().then(user => {
                                    res.json({ message: 'Password Changed Successfully' });
                                })
                                .catch(err => {
                                    return res.status(422).json({ error: 'Something went wrong' })
                                })
                        } else {
                            return res.status(422).json({ error: 'Invalid credentials' })
                        }
                    }
                )
            } else {
                return res.status(422).json({ error: 'Invalid credentials' })
            }
        }
    })
})


router.post('/setusername', (req, res) => {

    const { email, username } = req.body;

    if (!username || !email) {
        return res.status(422).json({ error: "All fields are required" });
    } else {
        User.find({ username }).then(async savedUser => {

            if (savedUser) {
                if (savedUser.length > 0) {
                    return res.status(422).json({ error: "Username Already Exist" });
                } else {
                    User.findOne({ email: email }).then(async savedUser => {

                        if (savedUser) {
                            savedUser.username = username;
                            savedUser.save().then(user => {
                                return res.status(200).json({ message: "Username Changed Successfully" });
                            }).catch(err => {
                                return res.status(422).json({ error: "Server error" });
                            })

                        }

                    })

                }
            } else {
                return res.status(422).json({ error: 'Invalid credentials' })
            }
        })



    }

})


router.post('/setDescription', (req, res) => {

    const { email, description } = req.body;

    if (!email || !description) {
        return res.status(422).json({ erroe: "All fields are required" });
    } else {
        User.findOne({ email: email }).then(async savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "User Doesn't Exist" });
            } else {
                savedUser.descrption = description
                savedUser.save().then(user => {
                    return res.status(200).json({ message: "Description Changed Successfully" });
                }).catch(err => {
                    res.status(422).json({ error: "Internal Server Error" })
                })
            }
        })
    }

})



router.post('/searchUser',(req,res)=>{
    const {keyword,email} = req.body;
    
    if(!keyword) {
        return res.status(422).json({error:"Please Search a Username"});
    }

    User.find({username:{$regex:keyword,$options:'i'}}).then(
        user=>{
           let data = [];
           user.filter(useremail=>!useremail.email.includes(email)).map(item=>{
            data.push(
                {
                    _id:item._id,
                    username:item.username,
                    email:item.email,
                    description:item.descrption,
                    profilepic: item.profilepic
                }
            )
           })

           if(data.length == 0 ){
            return res.status(422).json({error:'No user found'})
           }
           else{
            return res.status(422).json({message:"Users found",user:data})
           }

        }
    ).catch(err=>{
        res.status(422).json({error:"Server Error"});
    })
})

router.post('/otheruserProfile', (req, res) => {
    const { email } = req.body;

    User.findOne({ email:email }).then(
       async savedUser => {

        if(!savedUser){
            return res.status(422).json({error:"Invalid Credentials"})
        }

        let Data = {
            _id:savedUser._id,
            username:savedUser.username,
            email:savedUser.email,
            description:savedUser.descrption,
            profilepic:savedUser.profilepic,
            following:savedUser.following,
            followers:savedUser.followers,
            posts:savedUser.posts,
        };
        
        res.status(200).send({message:"User Found",user:Data})
    })
})


//check follow 


router.post('/checkfollow',(req,res)=>{
    const {followfrom, followto} = req.body;
    // console.log(followfrom, followto);

    if(!followfrom || !followto){
        return res.status(422).json({error:"Invalid credentials"});
    }
    else{
        User.findOne({email:followfrom})
        .then(async mainUser=>{
                if(!mainUser){
                    return res.status(422).json({error:"Invalid credentials"});
                }
                else{
                    if(mainUser.following.includes(followto)){
                        return res.status(200).json({message:"user is in following list"});
                    }
                    else{
                        return res.status(200).json({message:"user not in following list"});
                    }
                }

        }).catch(err=>{
            console.log(err);
        })
    }
})

//follow user
router.post('/followuser',(req,res)=>{
    const {followfrom, followto} = req.body;
    // console.log(followfrom, followto);

    if(!followfrom || !followto){
        return res.status(422).json({error:"Invalid credentials"});
    }
    else{
        User.findOne({email:followfrom})
        .then(async mainUser=>{
                if(!mainUser){
                    return res.status(422).json({error:"Invalid credentials"});
                }
                else{
                    if(mainUser.following.includes(followto)){
                    return res.status(200).json({message:"Already following"});
                    }

                    else{
                        mainUser.following.push(followto)
                        mainUser.save()


                        User.findOne({email:followto})
                        .then(async otheruser =>{
                            if(!otheruser){
                                return res.status(422).json({error:"Invalid credentials"});
                            }
                            else{
                
                              if(otheruser.followers.includes(followfrom)){
                                return res.status(200).json({message:"Already following"});
                              }
                              else{
                                otheruser.followers.push(followfrom)
                                otheruser.save()
                                return res.status(200).json({message:"User followed"})
                              }
                
                               
                            }
                        })
                    }
                    
                       
       
                    
                }

        })
      
    }
})
//unfollow user
router.post('/unfollowuser',(req,res)=>{
    const {followfrom, followto} = req.body;
    // console.log(followfrom, followto);

    if(!followfrom || !followto){
        return res.status(422).json({error:"Invalid credentials"});
    }
    else{
        User.findOne({email:followfrom})
        .then(async mainUser=>{
                if(!mainUser){
                    return res.status(422).json({error:"Invalid credentials"});
                }
                else{
                    if(mainUser.following.includes(followto)){
                        mainUser.following.pull(followto)
                        mainUser.save()


                        User.findOne({email:followto})
                        .then(async otheruser =>{
                            if(!otheruser){
                                return res.status(422).json({error:"Invalid credentials"});
                            }
                            else{
                
                              if(otheruser.followers.includes(followfrom)){
                                otheruser.followers.pull(followfrom)
                                otheruser.save()
                                return res.status(200).json({message:"User unfollowed"})
                              }
                              else{
                                return res.status(422).json({error:"Not following"});
                              }
                
                               
                            }
                        })
                    }

                    else{
                        return res.status(422).json({error:"Not following"});
                    }
                    
                       
       
                    
                }

        })
      
    }
})








module.exports = router;