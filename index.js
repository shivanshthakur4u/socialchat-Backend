const express = require('express');
const bodyParser = require('body-parser');
const port = 3000;
require('./db');
require('./Model/Users');
const app = express();



const authRoutes = require('./Routes/authRoutes');

app.use(bodyParser.json());
app.use(authRoutes);

app.get('/', (req, res) => {
    res.status(200).send('Welcome to home Page');
});

app.listen(port, (req, res) => {
    console.log(`Server Started at ${port}`);
})