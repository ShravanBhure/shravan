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
const userToSocket = {};

io.on('connection', socket => {
    socket.on('new-user-joined', (loggedInUser) => {
      const existingSocketId = userToSocket[loggedInUser];
      if (existingSocketId && existingSocketId !== socket.id) {
        const oldSocket = io.sockets.sockets.get(existingSocketId);
        if (oldSocket) {
          oldSocket.emit("kicked", "You were logged out due to another login with the same username.");
          oldSocket.disconnect(true); // force disconnect
        }
      }


      users[socket.id] = loggedInUser;
      userToSocket[loggedInUser] = socket.id;

      console.log(`${loggedInUser} joined the chat`);
        socket.broadcast.emit('new-user-joined',loggedInUser);
        io.emit('update-user-list', Object.values(users));
      });

    socket.on("send", (message) => {
      const loggedInUser = users[socket.id];
      if (loggedInUser) {
        socket.broadcast.emit("receive", {
          message,
          loggedInUser
        });
      }
    });


  socket.on('disconnect', () => {
    const loggedInUser = users[socket.id];
    delete users[socket.id];
    if (userToSocket[loggedInUser] === socket.id) {
      delete userToSocket[loggedInUser];
    }
    console.log(`${loggedInUser} left the chat`);

    socket.broadcast.emit('left', loggedInUser);
    io.emit('update-user-list', Object.values(users));
  });
});

// Start server on port 8000
server.listen(8000, '0.0.0.0', () => { // <-- Changed 'localhost' to '0.0.0.0'
  console.log("Server running on http://localhost:8000"); // This log message is still fine
});
