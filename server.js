const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(express.urlencoded({extended:false})); 

const str = "1234567890abcdefghijklmnopqrstuvwxyz"

function randomStr(len, arr) { 
            var ans = ''; 
            for (var i = len; i > 0; i--) { 
                ans +=  
                  arr[Math.floor(Math.random() * arr.length)]; 
            } 
            return ans; 
        } 


app.get('/', (req, res) => {
  // res.redirect(`/${uuidV4()}`)
  res.render('index');
})

app.get('/load', (req, res) => {
  const url = randomStr(10,str);
  res.redirect(`/${url}`);
})

app.post('/load2', (req,res) => {
  const url = req.param("roomID")
  res.redirect(`/${url}`);
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})


io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('sender-name', (username)=>{
      io.to(roomId).emit('catch-sender-name', username);

    })
    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})


server.listen(process.env.PORT||3030)
