const express = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();
const jwt = require('jsonwebtoken');

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


module.exports = router;