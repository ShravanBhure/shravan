const http = require("http"); // <-- use http instead of https
const { Server } = require("socket.io");

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', username => {
      console.log(`${username} joined the chat`);
        users[socket.id] = username;
        socket.broadcast.emit('user-joined', username);
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', {
            message: message,
            username: users[socket.id] // keep the key name consistent with client
        });
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
});

// Start server on port 8000
server.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
