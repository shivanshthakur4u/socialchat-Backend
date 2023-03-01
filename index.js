const express = require('express');
const bodyParser = require('body-parser');
const port = 3000;
const port1 = 3001;
require('./db');
require('./Model/Users');
require('./Model/Message');
const app = express();



const authRoutes = require('./Routes/authRoutes');
const uploadMediaRoute = require('./Routes/uploadMediaRoute');
const messageRoute = require('./Routes/messageroutes');



//socket.io
const {createServer} = require('http');
const {Server} = require('socket.io');
const httpServer = createServer();

const io = new Server(httpServer,{});


app.use(bodyParser.json());
app.use(authRoutes);
app.use(uploadMediaRoute);
app.use(messageRoute);
app.get('/', (req, res) => {
    res.status(200).send('Welcome to home Page');
});

//.........18

io.on('connection',(Socket)=>{
    console.log('USER CONNECTED-',Socket.id);

    Socket.on('disconnect',()=>{
        console.log('USER DISCONNECTED-',Socket.id);

    })
    Socket.on('join_room',(data)=>{
        console.log('USER_ID - ',Socket.id, "JOIN_ROOM - ",data.roomid);
        Socket.join(data)
})
Socket.on('send_message', (data)=>{
    console.log("MESSAGE RECEIVED - ", data);
    io.emit("receive_message",data);
})

})

httpServer.listen(port1,()=>{
    console.log(`socket Server Started at ${port1}`);
})


app.listen(port, (req, res) => {
    console.log(`Server Started at ${port}`);
})