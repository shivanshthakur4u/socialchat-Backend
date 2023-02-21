const mongoose = require('mongoose');
require('dotenv').config();


mongoose.connect(process.env.Mongo_URL, (err) => {
    if (!err) {
        console.log('db connection successfull');
    } else {
        console.log('error in db connection' + err);
    }
})